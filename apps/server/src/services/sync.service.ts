import {
  syncRepository,
  type SyncBatchItem,
} from "../repositories/sync.repository.js";
import { cacheService } from "./cache.service.js";
import { getSyncQueue } from "../config/queue.config.js";
import { v4 as uuidv4 } from "uuid";

export interface SyncPayload {
  batch: SyncBatchItem[];
  device_id?: string;
  last_sync?: number;
  app_version?: string;
}

export interface SyncResponse {
  success: boolean;
  batchId: string;
  mappings: Array<{
    entity: string;
    id_local: string;
    id_global: string;
  }>;
  conflicts: Array<{
    entity: string;
    id_local: string;
    error: string;
  }>;
  synced_at: number;
}

export class SyncService {
  async processBatch(
    payload: SyncPayload,
    userId: string
  ): Promise<SyncResponse> {
    const batchId = uuidv4();
    const startTime = Date.now();

    let syncLogCreated = false;
    
    try {
      // Registrar início da sincronização (opcional - não falha se a tabela não existir)
      try {
        await syncRepository.createSyncLog({
          id: uuidv4(),
          userId,
          batchId,
          recordsCount: payload.batch.length,
        });
        syncLogCreated = true;
      } catch (logError: any) {
        console.warn(`⚠️ Erro ao criar sync_log (continuando mesmo assim):`, logError?.message);
        // Continuar mesmo se o sync_log falhar
      }

      // Processar lote (isso é o mais importante)
      const result = await syncRepository.processBatch(payload.batch, userId);

      // Salvar conflicts no banco (opcional)
      if (result.conflicts.length > 0) {
        try {
          await syncRepository.saveSyncConflicts(batchId, result.conflicts);
        } catch (conflictError) {
          console.warn("⚠️ Erro ao salvar conflicts no banco (continuando):", conflictError);
        }
      }

      // Registrar conclusão bem-sucedida (opcional)
      if (syncLogCreated) {
        try {
          await syncRepository.updateSyncLog(batchId, {
            status: "completed",
            successCount: result.mappings.length,
            failureCount: result.conflicts.length,
          });
        } catch (updateError) {
          console.warn("⚠️ Erro ao atualizar sync_log (continuando):", updateError);
        }
      }

      // Cache do resultado por 1 hora (opcional)
      try {
        await cacheService.cacheSyncStatus(batchId, {
          status: "completed",
          mappings: result.mappings,
          conflicts: result.conflicts,
        });
      } catch (cacheError) {
        console.warn("⚠️ Erro ao cachear status (continuando):", cacheError);
      }

      const processingTime = Date.now() - startTime;
      console.log(
        `✅ Sincronização ${batchId} concluída em ${processingTime}ms: ${result.mappings.length} sucessos, ${result.conflicts.length} falhas`
      );

      // SEMPRE retornar os mappings, mesmo se houver conflicts
      return {
        success: result.mappings.length > 0, // Sucesso se pelo menos um item foi sincronizado
        batchId,
        mappings: result.mappings,
        conflicts: result.conflicts,
        synced_at: Date.now(),
      };
    } catch (error: any) {
      console.error(`❌ Erro na sincronização ${batchId}:`, error);
      console.error("Stack trace:", error?.stack);

      // Tentar registrar falha (opcional)
      if (syncLogCreated) {
        try {
          await syncRepository.updateSyncLog(batchId, {
            status: "failed",
            error: error.message || String(error),
          });
        } catch (updateError) {
          console.warn("⚠️ Erro ao atualizar sync_log com falha:", updateError);
        }
      }

      // Em vez de propagar 500, responder com conflicts estruturados para o cliente lidar
      const conflicts = (payload.batch || []).map((item) => ({
        entity: item.entity,
        id_local: item.id_local,
        error: error?.message || error?.toString() || "Erro interno do servidor",
      }));

      // Salvar conflicts no banco (opcional)
      if (conflicts.length > 0) {
        try {
          await syncRepository.saveSyncConflicts(batchId, conflicts);
        } catch (saveError) {
          console.warn("⚠️ Erro ao salvar conflicts no banco:", saveError);
        }
      }

      // Cache do resultado de falha por 1 hora (opcional)
      try {
        await cacheService.cacheSyncStatus(batchId, {
          status: "failed",
          mappings: [],
          conflicts,
          error: error?.message || String(error),
        });
      } catch (cacheError) {
        console.warn("⚠️ Erro ao cachear status de falha:", cacheError);
      }

      return {
        success: false,
        batchId,
        mappings: [],
        conflicts,
        synced_at: Date.now(),
      };
    }
  }

  async processBatchAsync(
    payload: SyncPayload,
    userId: string
  ): Promise<string> {
    const batchId = uuidv4();
    const queue = getSyncQueue();

    if (!queue) {
      // Se não há fila disponível, processa síncronamente
      await this.processBatch(payload, userId);
      return batchId;
    }

    // Adicionar à fila para processamento assíncrono
    await queue.add(
      "process-batch",
      { payload, userId, batchId },
      {
        jobId: batchId,
        priority: payload.batch.length > 50 ? 5 : 10, // Lotes maiores têm prioridade menor
      }
    );

    // Registrar início
    await syncRepository.createSyncLog({
      id: uuidv4(),
      userId,
      batchId,
      recordsCount: payload.batch.length,
    });

    return batchId;
  }

  async getBatchStatus(batchId: string): Promise<any> {
    // Primeiro verifica o cache
    const cached = await cacheService.getSyncStatus(batchId);
    if (cached) {
      return cached;
    }

    // Se não estiver no cache, busca no banco
    try {
      const log = await syncRepository.getSyncLog(batchId);
      if (log) {
        const status = {
          status: log.status,
          mappings: [],
          conflicts: [],
          error: log.error,
        };

        // Se estiver completo, buscar mappings e conflicts do banco
        if (log.status === "completed") {
          const conflicts = await syncRepository.getSyncConflicts(batchId);
          // Mappings são retornados no resultado do processamento, mas podem estar no cache
          status.conflicts = conflicts;
        }

        // Cachear o resultado
        await cacheService.cacheSyncStatus(batchId, status);

        return status;
      }
    } catch (error) {
      console.error(`Erro ao buscar status do batch ${batchId} no banco:`, error);
    }

    return null;
  }

  async getChangesSince(timestamp: Date, userId: string) {
    // Implementar busca de mudanças desde timestamp
    return {
      changes: [],
      timestamp: Date.now(),
    };
  }
}

export const syncService = new SyncService();

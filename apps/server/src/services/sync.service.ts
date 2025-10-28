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

    try {
      // Registrar início da sincronização
      await syncRepository.createSyncLog({
        id: uuidv4(),
        userId,
        batchId,
        recordsCount: payload.batch.length,
      });

      // Processar lote
      const result = await syncRepository.processBatch(payload.batch, userId);

      // Registrar conclusão bem-sucedida
      await syncRepository.updateSyncLog(batchId, {
        status: "completed",
        successCount: result.mappings.length,
        failureCount: result.conflicts.length,
      });

      // Cache do resultado por 1 hora
      await cacheService.cacheSyncStatus(batchId, {
        status: "completed",
        mappings: result.mappings,
        conflicts: result.conflicts,
      });

      const processingTime = Date.now() - startTime;
      console.log(
        `✅ Sincronização ${batchId} concluída em ${processingTime}ms`
      );

      return {
        success: true,
        batchId,
        mappings: result.mappings,
        conflicts: result.conflicts,
        synced_at: Date.now(),
      };
    } catch (error: any) {
      // Registrar falha
      await syncRepository.updateSyncLog(batchId, {
        status: "failed",
        error: error.message,
      });

      console.error(`❌ Erro na sincronização ${batchId}:`, error);

      // Em vez de propagar 500, responder com conflicts estruturados para o cliente lidar
      const conflicts = (payload.batch || []).map((item) => ({
        entity: item.entity,
        id_local: item.id_local,
        error: error?.message || "Erro interno do servidor",
      }));

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
    // Implementar busca no banco se necessário
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

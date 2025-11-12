import type { Request, Response, NextFunction } from "@types/express";
import { z } from "zod";
import { syncService } from "../services/sync.service.js";
import { storageService } from "../services/storage.service.js";
import { AppError } from "../middlewares/error.middleware.js";
import { v4 as uuidv4 } from "uuid";

const syncBatchItemSchema = z.object({
  entity: z.enum([
    "responsavel",
    "aluno",
    "turma",
    "matricula",
    "documento",
    "pendencia",
  ]),
  operation: z.enum(["create", "update", "delete"]),
  id_local: z.string(),
  data: z.record(z.any()),
});

const syncPayloadSchema = z.object({
  batch: z.array(syncBatchItemSchema),
  device_id: z.string().optional(),
  last_sync: z.number().optional(),
  app_version: z.string().optional(),
});

export class SyncController {
  /**
   * Sincroniza dados em lote
   * POST /api/sync
   */
  async sync(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();
    try {
      if (!req.user) {
        throw new AppError(401, "Não autenticado");
      }

      const userId = req.user.id;
      console.log(`🔄 [Sync] Iniciando sincronização para usuário ${userId}`);

      // Evitar crash do Zod em ambientes com múltiplas versões: validar manualmente
      const rawBody: any =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      // Tentativa segura com Zod, mas sem quebrar em caso de incompatibilidade
      let payload: any;
      try {
        payload = syncPayloadSchema.parse(rawBody);
        console.log(`✅ [Sync] Payload validado com Zod: ${payload.batch.length} itens`);
      } catch (zerr) {
        console.warn(`⚠️ [Sync] Validação Zod falhou, usando fallback manual`);
        // Fallback manual para evitar "_zod" undefined em alguns empacotadores
        const body = rawBody || {};
        const batch = Array.isArray(body.batch) ? body.batch : [];
        const sanitizedBatch = batch
          .filter((it) => it && typeof it === "object")
          .map((it) => ({
            entity: String(it.entity || ""),
            operation: String(it.operation || "create"),
            id_local: String(it.id_local || it.idLocal || ""),
            data: typeof it.data === "object" && it.data ? it.data : {},
          }))
          .filter((it) => it.entity && it.id_local);

        payload = {
          batch: sanitizedBatch,
          device_id:
            typeof body.device_id === "string" ? body.device_id : undefined,
          last_sync:
            typeof body.last_sync === "number" ? body.last_sync : undefined,
          app_version:
            typeof body.app_version === "string" ? body.app_version : undefined,
        };

        if (payload.batch.length === 0) {
          console.error(`❌ [Sync] Payload inválido: batch vazio`);
          res
            .status(400)
            .json({ success: false, message: "Payload inválido: batch vazio" });
          return;
        }
        console.log(`✅ [Sync] Payload validado manualmente: ${payload.batch.length} itens`);
      }

      // Log detalhado do batch
      const entityCounts = payload.batch.reduce((acc: any, item: any) => {
        acc[item.entity] = (acc[item.entity] || 0) + 1;
        return acc;
      }, {});
      console.log(`📦 [Sync] Distribuição de entidades no batch:`, entityCounts);
      console.log(`📋 [Sync] IDs locais no batch:`, payload.batch.map((b: any) => `${b.entity}:${b.id_local}`).slice(0, 10));

      // Processar lote síncronamente (para pequenos lotes)
      if (payload.batch.length <= 50) {
        console.log(`⚡ [Sync] Processando lote síncronamente (${payload.batch.length} itens)`);
        const result = await syncService.processBatch(payload, userId);
        
        const duration = Date.now() - startTime;
        console.log(`✅ [Sync] Lote processado com sucesso em ${duration}ms:`, {
          mappings: result.mappings?.length || 0,
          conflicts: result.conflicts?.length || 0,
        });

        res.status(200).json({
          success: true,
          data: result,
        });
        return;
      }

      // Processar assíncronamente (para grandes lotes)
      console.log(`⚡ [Sync] Processando lote assincronamente (${payload.batch.length} itens)`);
      const batchId = await syncService.processBatchAsync(payload, userId);
      console.log(`📝 [Sync] Lote adicionado à fila: ${batchId}`);

      res.status(202).json({
        success: true,
        message: "Lote adicionado à fila de processamento",
        data: {
          batchId,
          status: "processing",
        },
      });
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ [Sync] Erro após ${duration}ms:`, {
        message: error?.message,
        code: error?.code,
        stack: error?.stack?.split('\n').slice(0, 3).join('\n'),
      });
      next(error);
    }
  }

  /**
   * Obtém status de um lote de sincronização
   * GET /api/sync/status/:batchId
   */
  async getSyncStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { batchId } = req.params;

      if (!batchId) {
        throw new AppError(400, "batchId é obrigatório");
      }

      const status = await syncService.getBatchStatus(batchId);

      if (!status) {
        res.status(404).json({
          success: false,
          message: "Batch não encontrado",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém mudanças desde um timestamp
   * GET /api/sync/changes
   */
  async getChanges(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Não autenticado");
      }

      const since = req.query.since as string;
      const sinceDate = since ? new Date(parseInt(since)) : new Date(0);

      const changes = await syncService.getChangesSince(sinceDate, req.user.id);

      res.status(200).json({
        success: true,
        data: changes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Faz upload de um documento
   * POST /api/sync/upload
   */
  async uploadDocument(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Não autenticado");
      }

      if (!req.file) {
        throw new AppError(400, "Nenhum arquivo enviado");
      }

      const file = req.file.buffer;
      const fileName = req.file.originalname || `documento-${uuidv4()}`;

      // Validar tamanho do arquivo (máximo 10MB)
      await storageService.validateFileSize(file.length, 10);

      // Validar tipo de arquivo
      await storageService.validateFileType(fileName, [
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "webp",
      ]);

      // Upload para Supabase Storage
      const result = await storageService.uploadFile(
        file,
        fileName,
        `documentos/${req.user.id}`
      );

      res.status(200).json({
        success: true,
        message: "Documento enviado com sucesso",
        data: {
          url: result.url,
          path: result.path,
          size: result.size,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const syncController = new SyncController();

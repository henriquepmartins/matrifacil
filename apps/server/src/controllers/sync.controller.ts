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
    try {
      if (!req.user) {
        throw new AppError(401, "Não autenticado");
      }

      const payload = syncPayloadSchema.parse(req.body);
      const userId = req.user.id;

      // Processar lote síncronamente (para pequenos lotes)
      if (payload.batch.length <= 50) {
        const result = await syncService.processBatch(payload, userId);

        res.status(200).json({
          success: true,
          data: result,
        });
        return;
      }

      // Processar assíncronamente (para grandes lotes)
      const batchId = await syncService.processBatchAsync(payload, userId);

      res.status(202).json({
        success: true,
        message: "Lote adicionado à fila de processamento",
        data: {
          batchId,
          status: "processing",
        },
      });
    } catch (error) {
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

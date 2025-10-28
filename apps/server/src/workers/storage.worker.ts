import { Worker } from "bullmq";
import { getRedisClient } from "../config/redis.config.js";
import { storageService } from "../services/storage.service.js";
import { SyncQueueType } from "../config/queue.config.js";

interface StorageJob {
  file: Buffer;
  fileName: string;
  folder: string;
}

export function startStorageWorker() {
  const redis = getRedisClient();

  if (!redis) {
    console.warn("⚠️ Redis não disponível - worker de storage não iniciado");
    return null;
  }

  const worker = new Worker<StorageJob>(
    SyncQueueType.STORAGE_UPLOAD,
    async (job) => {
      const { file, fileName, folder } = job.data;

      console.log(`📤 Processando upload: ${fileName}`);

      try {
        // Validar arquivo
        await storageService.validateFileSize(file.length, 10);
        await storageService.validateFileType(fileName, [
          "pdf",
          "jpg",
          "jpeg",
          "png",
          "webp",
        ]);

        // Upload para Supabase Storage
        const result = await storageService.uploadFile(file, fileName, folder);

        console.log(`✅ Upload concluído: ${result.url}`);

        return result;
      } catch (error: any) {
        console.error(`❌ Erro ao fazer upload de ${fileName}:`, error);
        throw error;
      }
    },
    {
      connection: redis as any,
      concurrency: 5, // Processar até 5 uploads simultaneamente
      limiter: {
        max: 20, // Máximo 20 uploads por minuto
        duration: 60000, // Por minuto
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Upload ${job.id} completado`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Upload ${job?.id} falhou:`, err);
  });

  worker.on("error", (err) => {
    console.error("❌ Erro no worker de storage:", err);
  });

  console.log("✅ Worker de storage iniciado");

  return worker;
}

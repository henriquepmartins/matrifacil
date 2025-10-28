import { Worker } from "bullmq";
import { getRedisClient } from "../config/redis.config.js";
import { syncService, type SyncPayload } from "../services/sync.service.js";
import { SyncQueueType } from "../config/queue.config.js";

export function startSyncWorker() {
  const redis = getRedisClient();

  if (!redis) {
    console.warn(
      "⚠️ Redis não disponível - worker de sincronização não iniciado"
    );
    return null;
  }

  const worker = new Worker<{
    payload: SyncPayload;
    userId: string;
    batchId: string;
  }>(
    SyncQueueType.BATCH_SYNC,
    async (job) => {
      const { payload, userId, batchId } = job.data;

      console.log(
        `🔧 Processando lote ${batchId} com ${payload.batch.length} itens`
      );

      try {
        // Processar lote
        const result = await syncService.processBatch(payload, userId);

        console.log(`✅ Lote ${batchId} processado com sucesso`);

        return result;
      } catch (error: any) {
        console.error(`❌ Erro ao processar lote ${batchId}:`, error);
        throw error;
      }
    },
    {
      connection: redis as any,
      concurrency: 3, // Processar até 3 lotes simultaneamente
      limiter: {
        max: 10, // Máximo 10 lotes por minuto
        duration: 60000, // Por minuto
      },
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completado`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} falhou:`, err);
  });

  worker.on("error", (err) => {
    console.error("❌ Erro no worker de sincronização:", err);
  });

  console.log("✅ Worker de sincronização iniciado");

  return worker;
}

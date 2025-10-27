import Redis from "ioredis";
import { env } from "./env.config.js";

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    console.warn(
      "⚠️ Redis não configurado (REDIS_URL não definida). Cache desabilitado."
    );
    return null;
  }

  if (redis) {
    return redis;
  }

  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // BullMQ requires this to be null
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on("error", (err) => {
      console.error("❌ Erro no Redis:", err);
      redis = null;
    });

    redis.on("connect", () => {
      console.log("✅ Conexão com Redis estabelecida");
    });

    return redis;
  } catch (error) {
    console.error("❌ Erro ao conectar ao Redis:", error);
    return null;
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

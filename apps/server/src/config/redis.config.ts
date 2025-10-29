import Redis from "ioredis";
import { env } from "./env.config.js";

let redis: Redis | null = null;
let connectionAttempted = false;
let lastError: Error | null = null;

export function getRedisClient(): Redis | null {
  if (!env.REDIS_URL) {
    if (!connectionAttempted) {
      console.warn(
        "⚠️ Redis não configurado (REDIS_URL não definida). Cache desabilitado."
      );
      connectionAttempted = true;
    }
    return null;
  }

  if (redis && redis.status === "ready") {
    return redis;
  }

  // Se já tentamos conectar antes e falhou, não tentar novamente até resetar
  if (connectionAttempted && redis === null && lastError) {
    return null;
  }

  try {
    connectionAttempted = true;
    lastError = null;

    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // BullMQ requires this to be null
      retryStrategy(times) {
        if (times > 10) {
          console.warn(
            "⚠️ Redis não disponível após várias tentativas - parando reconexão automática"
          );
          return null; // Para de tentar reconectar
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true, // Não conecta imediatamente
      enableOfflineQueue: false, // Não coloca comandos em fila offline
      showFriendlyErrorStack: true,
      connectTimeout: 5000, // Timeout de 5s
      maxRetries: 2, // Máximo 2 tentativas iniciais
    });

    redis.on("error", (err) => {
      if (lastError?.message !== err.message) {
        console.error("❌ Erro no Redis:", err.message);
        console.error("   Redis está desabilitado. Para habilitar:");
        console.error(
          "   - Certifique-se de que o Redis está rodando (redis-server)"
        );
        console.error("   - Verifique se a URL está correta no .env");
        console.error(
          "   - Ou remova REDIS_URL do .env para desabilitar completamente"
        );
        lastError = err;
      }
      redis = null;
    });

    redis.on("ready", () => {
      console.log("✅ Conexão com Redis estabelecida");
      lastError = null;
    });

    redis.on("close", () => {
      console.log("⚠️ Conexão com Redis fechada");
      redis = null;
    });

    return redis;
  } catch (error: any) {
    console.error("❌ Erro ao criar cliente Redis:", error.message || error);
    redis = null;
    lastError = error;
    return null;
  }
}

export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

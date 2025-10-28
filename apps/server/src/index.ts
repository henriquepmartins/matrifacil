import { createApp } from "./app.js";
import { env } from "./config/env.config.js";
import { initializeDatabase } from "./infrastructure/database/database.config.js";
import { startSyncWorker } from "./workers/sync.worker.js";
import { startStorageWorker } from "./workers/storage.worker.js";
import { closeQueues } from "./config/queue.config.js";

async function startServer() {
  try {
    console.log("🚀 Iniciando servidor MatriFácil...\n");

    await initializeDatabase();

    // Iniciar workers de processamento
    const syncWorker = startSyncWorker();
    const storageWorker = startStorageWorker();

    const app = createApp();

    const port = parseInt(env.PORT);

    // Graceful shutdown
    const shutdown = async () => {
      console.log("\n🛑 Encerrando servidor graciosamente...");

      if (syncWorker) {
        await syncWorker.close();
      }

      if (storageWorker) {
        await storageWorker.close();
      }

      await closeQueues();

      process.exit(0);
    };

    app.listen(port, () => {
      console.log(`\n✅ Servidor rodando com sucesso!`);
      console.log(`📍 URL: http://localhost:${port}`);
      console.log(`📄 Documentação: http://localhost:${port}/docs`);
      console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
      console.log(`\nPressione CTRL+C para parar o servidor\n`);
    });

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM recebido. Encerrando servidor graciosamente...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n\n🛑 SIGINT recebido. Encerrando servidor...");
  process.exit(0);
});

startServer();

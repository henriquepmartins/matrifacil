import { createApp } from "./app.js";
import { env } from "./config/env.config.js";
import { initializeDatabase } from "./infrastructure/database/database.config.js";

async function startServer() {
  try {
    console.log("🚀 Iniciando servidor MatriFácil...\n");

    await initializeDatabase();

    const app = createApp();

    const port = parseInt(env.PORT);
    app.listen(port, () => {
      console.log(`\n✅ Servidor rodando com sucesso!`);
      console.log(`📍 URL: http://localhost:${port}`);
      console.log(`📄 Documentação: http://localhost:${port}/docs`);
      console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
      console.log(`\nPressione CTRL+C para parar o servidor\n`);
    });
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

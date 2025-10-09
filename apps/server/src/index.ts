import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initializeDatabase } from "./config/database.js";

/**
 * Inicializa o servidor
 */
async function startServer() {
  try {
    console.log("🚀 Iniciando servidor MatriFácil...\n");

    // Inicializa a conexão com o banco de dados
    await initializeDatabase();

    // Cria a aplicação Express
    const app = createApp();

    // Inicia o servidor
    const port = parseInt(env.PORT);
    app.listen(port, () => {
      console.log(`\n✅ Servidor rodando com sucesso!`);
      console.log(`📍 URL: http://localhost:${port}`);
      console.log(`🏥 Health check: http://localhost:${port}/health`);
      console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
      console.log(`\nPressione CTRL+C para parar o servidor\n`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM recebido. Encerrando servidor graciosamente...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n\n🛑 SIGINT recebido. Encerrando servidor...");
  process.exit(0);
});

// Inicia o servidor
startServer();

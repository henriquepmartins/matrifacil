import { createApp } from "../app.js";
import { initializeDatabase } from "../infrastructure/database/database.config.js";

// Inicializa o banco de dados uma vez (lazy initialization)
let isDatabaseInitialized = false;
let initPromise: Promise<void> | null = null;
let appInstance: ReturnType<typeof createApp> | null = null;

async function ensureDatabaseInitialized() {
  if (isDatabaseInitialized) {
    return;
  }

  if (!initPromise) {
    initPromise = initializeDatabase().then(() => {
      isDatabaseInitialized = true;
    });
  }

  await initPromise;
}

function getApp() {
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
}

// Handler serverless compatível com Vercel
export default async function handler(req: any, res: any) {
  try {
    // Garante que o banco está inicializado antes de processar requisições
    await ensureDatabaseInitialized();

    // Obtém instância do app (criada uma vez e reutilizada)
    const app = getApp();

    // Usa o app como handler serverless
    return app(req, res);
  } catch (error) {
    console.error("Error in serverless handler:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}


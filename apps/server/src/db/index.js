import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined!\n\n" +
      "Please set the DATABASE_URL environment variable with your database connection string."
  );
}

// Configuração específica para Supabase com fallback para IPv4
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    require: true,
  },
  // Configurações de timeout e retry
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 20,
  // Configurações específicas para Supabase
  application_name: "matrifacil-server",
  // Configurações de retry
  retryDelayMillis: 1000,
  retryAttempts: 3,
  // Força IPv4 se possível
  family: 4,
  // Configurações adicionais para estabilidade
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

export const db = drizzle(pool);

export async function checkDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    return false;
  }
}

export async function initializeDatabase() {
  console.log("🔌 Conectando ao banco de dados...");
  const isConnected = await checkDatabaseConnection();

  if (!isConnected) {
    throw new Error("Falha ao conectar ao banco de dados");
  }

  console.log("✅ Banco de dados conectado com sucesso!");
}

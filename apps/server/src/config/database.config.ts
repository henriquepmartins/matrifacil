import { db } from "@matrifacil-/db/index.js";
import { sql } from "drizzle-orm";

export { db };

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    return false;
  }
}

export async function initializeDatabase(): Promise<void> {
  console.log("🔌 Conectando ao banco de dados...");
  const isConnected = await checkDatabaseConnection();

  if (!isConnected) {
    throw new Error("Falha ao conectar ao banco de dados");
  }

  console.log("✅ Banco de dados conectado com sucesso!");
}

const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined!\n\n" +
      "Please set the DATABASE_URL environment variable with your database connection string."
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Força uso de IPv4 e configurações de conexão
  host: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : undefined,
  port: process.env.DATABASE_URL ? parseInt(new URL(process.env.DATABASE_URL).port) : undefined,
  // Configurações de timeout e retry
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
  // Força IPv4
  family: 4
});

const db = drizzle(pool);

module.exports = { db };

module.exports.checkDatabaseConnection = async function () {
  try {
    const { sql } = require("drizzle-orm");
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    return false;
  }
};

module.exports.initializeDatabase = async function () {
  console.log("🔌 Conectando ao banco de dados...");
  const isConnected = await module.exports.checkDatabaseConnection();

  if (!isConnected) {
    throw new Error("Falha ao conectar ao banco de dados");
  }

  console.log("✅ Banco de dados conectado com sucesso!");
};

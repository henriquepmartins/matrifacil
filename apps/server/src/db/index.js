const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined!\n\n" +
      "Please set the DATABASE_URL environment variable with your database connection string."
  );
}

// Parse DATABASE_URL para extrair componentes
const url = new URL(process.env.DATABASE_URL);
const pool = new Pool({
  host: url.hostname,
  port: parseInt(url.port),
  database: url.pathname.slice(1), // Remove leading slash
  user: url.username,
  password: url.password,
  ssl: {
    rejectUnauthorized: false,
    require: true
  },
  // Configurações de timeout e retry
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 20,
  // Força IPv4 explicitamente
  family: 4,
  // Configurações adicionais para IPv4
  keepAlive: true,
  keepAliveInitialDelayMillis: 0
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

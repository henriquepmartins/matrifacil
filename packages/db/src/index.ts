import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dns from "node:dns";
import { promisify } from "util";

// Força resolução IPv4 primeiro para evitar ENETUNREACH em ambientes sem IPv6 (Railway)
dns.setDefaultResultOrder("ipv4first");

const lookup = promisify(dns.lookup);

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined!\n\n" +
      "Please configure the DATABASE_URL environment variable in your deployment platform.\n" +
      "For Railway: Add DATABASE_URL in the Variables section of your project.\n" +
      "For local development: Create apps/server/.env with DATABASE_URL.\n" +
      "See RAILWAY_SETUP.md for instructions."
  );
}

// Função para resolver hostname para IPv4 e modificar a connection string
async function getIPv4ConnectionString(connectionString: string): Promise<string> {
  try {
    const url = new URL(connectionString);
    const hostname = url.hostname;
    
    // Se já for um IP, retorna como está
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return connectionString;
    }
    
    // Resolve para IPv4
    const { address } = await lookup(hostname, { family: 4 });
    url.hostname = address;
    return url.toString();
  } catch (error) {
    console.warn("⚠️ Erro ao resolver hostname para IPv4, usando connectionString original:", error);
    return connectionString;
  }
}

// Resolve hostname para IPv4 antes de criar o Pool (top-level await suportado em ESM)
let resolvedConnectionString: string;
try {
  resolvedConnectionString = await getIPv4ConnectionString(process.env.DATABASE_URL);
} catch (error) {
  console.warn("⚠️ Erro ao resolver hostname, usando connectionString original:", error);
  resolvedConnectionString = process.env.DATABASE_URL;
}

// Configuração específica para Supabase com fallback para IPv4
const pool = new Pool({
  connectionString: resolvedConnectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  // Força uso de IPv4 apenas (Railway não suporta IPv6 adequadamente)
  family: 4,
  // Configurações de timeout e retry
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 20,
  // Configurações específicas para Supabase
  application_name: "matrifacil-server",
  // Configurações adicionais para estabilidade
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
});

// Configuração do Drizzle - Prepared statements habilitados para conexão direta
export const db = drizzle(pool, {
  logger: false,
});

// Export schemas
export * from "./schema/auth.js";
export * from "./schema/matriculas.js";
export * from "./schema/relatorios.js";
export * from "./schema/sync.js";

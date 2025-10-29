import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dns from "node:dns";

// Força resolução DNS para IPv4 primeiro (deve ser configurado antes de qualquer conexão)
// Isso resolve problemas de conectividade IPv6 no Railway e outros ambientes
dns.setDefaultResultOrder("ipv4first");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined!\n\n" +
      "Please configure the DATABASE_URL environment variable in your deployment platform.\n" +
      "For Railway: Add DATABASE_URL in the Variables section of your project.\n" +
      "For local development: Create apps/server/.env with DATABASE_URL.\n" +
      "See RAILWAY_SETUP.md for instructions."
  );
}

// Configuração específica para Supabase com fallback para IPv4
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Configurações de timeout e retry
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 20,
  // Configurações específicas para Supabase
  application_name: "matrifacil-server",
  // Configurações adicionais para estabilidade
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  // Forçar uso de IPv4 para evitar problemas de conectividade no Railway
  // @ts-expect-error - família de IP não está tipada no @types/pg mas é suportada pelo node-pg
  family: 4,
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

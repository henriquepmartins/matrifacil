import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined!\n\n" +
      "Please create the file 'apps/web/.env' with your Supabase connection string.\n" +
      "See ENV_SETUP.md for instructions."
  );
}

// Parse DATABASE_URL para extrair componentes
const url = new URL(process.env.DATABASE_URL);

// Configuração específica para Supabase
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
  connectionTimeoutMillis: 60000,
  idleTimeoutMillis: 30000,
  max: 20,
  // Força IPv4 explicitamente
  family: 4,
  // Configurações adicionais para IPv4
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  // Configurações específicas para Supabase
  application_name: 'matrifacil-server',
  // Tentar resolver DNS via IPv4
  lookup: (hostname, options, callback) => {
    const dns = require('dns');
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) {
        console.error('DNS lookup error:', err);
        return callback(err);
      }
      console.log(`Resolved ${hostname} to ${address} (IPv4)`);
      callback(null, address, 4);
    });
  }
});

export const db = drizzle(pool);

// Export schemas
export * from "./schema/auth.js";
export * from "./schema/matriculas.js";
export * from "./schema/relatorios.js";

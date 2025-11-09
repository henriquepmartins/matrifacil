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

// Função para converter connection string do Supabase para usar pooler se necessário
function convertToPoolerIfSupabase(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const hostname = url.hostname;
    
    // Se já é um IP ou não é Supabase, retorna como está
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || !hostname.includes("supabase.co")) {
      return connectionString;
    }
    
    // Se já está usando pooler, retorna como está
    if (hostname.includes("pooler")) {
      return connectionString;
    }
    
    // Converte conexão direta para pooler do Supabase
    // Formato: db.xxxxx.supabase.co -> aws-0-[REGION].pooler.supabase.com
    // Extrai project ref do hostname original
    const match = hostname.match(/db\.([^.]+)\.supabase\.co/);
    if (match) {
      const projectRef = match[1];
      
      // Usa pooler na porta 5432 (session mode - suporta prepared statements do Drizzle)
      // Transaction mode (porta 6543) não suporta prepared statements
      // Tenta usar a região do ambiente ou usa us-east-1 como padrão
      const region = process.env.SUPABASE_REGION || "us-east-1";
      
      url.hostname = `aws-0-${region}.pooler.supabase.com`;
      url.port = "5432";
      // Modifica o user para incluir project ref: postgres.project-ref
      const username = url.username;
      if (username === "postgres") {
        url.username = `postgres.${projectRef}`;
      }
      console.log(`✅ Convertendo para connection pooler do Supabase (região: ${region}, porta: 5432 - session mode)`);
      console.log(`   Session mode suporta prepared statements do Drizzle ORM`);
      console.log(`   Se a conexão falhar, defina SUPABASE_REGION no .env com a região correta do seu projeto`);
      console.log(`   Exemplo: SUPABASE_REGION=us-west-1 ou SUPABASE_REGION=eu-west-1`);
      return url.toString();
    }
    
    return connectionString;
  } catch (error) {
    console.warn("⚠️ Erro ao converter para pooler, usando connectionString original:", error);
    return connectionString;
  }
}

// Função para resolver hostname para IPv4 e modificar a connection string
// IMPORTANTE: Esta função só deve ser chamada para conexões que NÃO são Supabase
// Para Supabase, sempre use convertToPoolerIfSupabase primeiro
async function getIPv4ConnectionString(connectionString: string): Promise<string> {
  try {
    const url = new URL(connectionString);
    const hostname = url.hostname;
    
    // Se já for um IP, retorna como está
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return connectionString;
    }
    
    // Se for Supabase, não tenta resolver DNS - deve usar pooler
    if (hostname.includes("supabase.co") && !hostname.includes("pooler")) {
      console.warn("⚠️ Detectado Supabase sem pooler na resolução DNS - convertendo para pooler...");
      return convertToPoolerIfSupabase(connectionString);
    }
    
    // Tenta resolver para IPv4 com timeout
    try {
      const { address } = await lookup(hostname, { family: 4 });
      url.hostname = address;
      console.log(`✅ Resolvido ${hostname} para IPv4: ${address}`);
      return url.toString();
    } catch (dnsError: any) {
      // Se falhar o DNS, tenta converter para pooler (Supabase) como fallback
      if (hostname.includes("supabase.co") && !hostname.includes("pooler")) {
        console.warn("⚠️ Erro ao resolver DNS, tentando converter para connection pooler...");
        return convertToPoolerIfSupabase(connectionString);
      }
      throw dnsError;
    }
  } catch (error) {
    // Se ainda falhar, tenta pooler como último recurso (se for Supabase)
    const url = new URL(connectionString);
    if (url.hostname.includes("supabase.co") && !url.hostname.includes("pooler")) {
      const poolerString = convertToPoolerIfSupabase(connectionString);
      if (poolerString !== connectionString) {
        console.warn("⚠️ Usando connection pooler como fallback após erro de DNS");
        return poolerString;
      }
    }
    console.warn("⚠️ Erro ao resolver hostname para IPv4, usando connectionString original:", error);
    return connectionString;
  }
}

// Resolve hostname para IPv4 antes de criar o Pool (top-level await suportado em ESM)
// Para Supabase, usa pooler diretamente (mais confiável e evita problemas de DNS)
// IMPORTANTE: Sempre converte para pooler ANTES de tentar resolver DNS para evitar problemas com IPv6 no Railway
let resolvedConnectionString: string;
try {
  const originalUrl = process.env.DATABASE_URL;
  const url = new URL(originalUrl);
  const disablePooler = String(process.env.SUPABASE_DISABLE_POOLER || "false").toLowerCase() === "true";
  
  // Se já está usando pooler do Supabase, usa diretamente sem resolver DNS
  if (!disablePooler && url.hostname.includes("pooler.supabase.com")) {
    console.log("✅ Usando connection pooler do Supabase diretamente (sem resolução DNS)");
    resolvedConnectionString = originalUrl;
  } 
  // Se for Supabase e não estiver usando pooler, converte imediatamente (ANTES de resolver DNS)
  // Isso evita problemas com IPv6 no Railway
  else if (!disablePooler && url.hostname.includes("supabase.co")) {
    console.log("🔧 Detectado Supabase - convertendo para connection pooler (evita problemas de DNS/IPv6)...");
    resolvedConnectionString = convertToPoolerIfSupabase(originalUrl);
    // Se a conversão não mudou nada (não é Supabase válido), tenta resolver DNS
    if (resolvedConnectionString === originalUrl) {
      console.log("⚠️ Conversão para pooler não aplicada, tentando resolver DNS...");
      resolvedConnectionString = await getIPv4ConnectionString(originalUrl);
    }
  } 
  // Para outras conexões, tenta resolver DNS normalmente
  else {
    resolvedConnectionString = await getIPv4ConnectionString(originalUrl);
  }
} catch (error) {
  console.warn("⚠️ Erro ao processar connection string, tentando pooler como fallback...", error);
  // Tenta pooler como último recurso
  const disablePooler = String(process.env.SUPABASE_DISABLE_POOLER || "false").toLowerCase() === "true";
  if (disablePooler) {
    resolvedConnectionString = process.env.DATABASE_URL;
  } else {
    const poolerString = convertToPoolerIfSupabase(process.env.DATABASE_URL);
    resolvedConnectionString = poolerString !== process.env.DATABASE_URL 
      ? poolerString 
      : process.env.DATABASE_URL;
  }
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

// Configuração do Drizzle
// Prepared statements são habilitados por padrão (compatível com session mode do pooler - porta 5432)
// Se usar transaction mode (porta 6543), desabilitar com: { logger: false, preparedStatements: false }
export const db = drizzle(pool, {
  logger: false,
  // preparedStatements: true (padrão) - funciona com session mode (porta 5432)
});

// Export schemas
export * from "./schema/auth.js";
export * from "./schema/matriculas.js";
export * from "./schema/relatorios.js";
export * from "./schema/sync.js";

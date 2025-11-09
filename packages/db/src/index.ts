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
    
    // Extrai project ref do SUPABASE_URL (mais confiável que do DATABASE_URL)
    // O SUPABASE_URL tem o formato: https://xxxxx.supabase.co
    let projectRef: string | null = null;
    
    if (process.env.SUPABASE_URL) {
      try {
        const supabaseUrl = new URL(process.env.SUPABASE_URL);
        const supabaseMatch = supabaseUrl.hostname.match(/^([^.]+)\.supabase\.co$/);
        if (supabaseMatch) {
          projectRef = supabaseMatch[1];
        }
      } catch (e) {
        console.warn("⚠️ Erro ao extrair project ref do SUPABASE_URL:", e);
      }
    }
    
    // Se não conseguiu extrair do SUPABASE_URL, tenta do hostname do DATABASE_URL
    if (!projectRef) {
      const match = hostname.match(/db\.([^.]+)\.supabase\.co/);
      if (match) {
        projectRef = match[1];
      }
    }
    
    if (!projectRef) {
      console.warn("⚠️ Não foi possível extrair project ref do Supabase, usando connectionString original");
      return connectionString;
    }
    
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
    console.log(`✅ Convertendo para connection pooler do Supabase (project ref: ${projectRef}, região: ${region}, porta: 5432 - session mode)`);
    console.log(`   Session mode suporta prepared statements do Drizzle ORM`);
    console.log(`   Se a conexão falhar, defina SUPABASE_REGION no .env com a região correta do seu projeto`);
    console.log(`   Exemplo: SUPABASE_REGION=us-west-1 ou SUPABASE_REGION=eu-west-1`);
    return url.toString();
  } catch (error) {
    console.warn("⚠️ Erro ao converter para pooler, usando connectionString original:", error);
    return connectionString;
  }
}

// Função para resolver hostname para IPv4 e modificar a connection string
// IMPORTANTE: Esta função NÃO deve tentar usar pooler - apenas resolve DNS para IPv4
async function getIPv4ConnectionString(connectionString: string): Promise<string> {
  try {
    const url = new URL(connectionString);
    const hostname = url.hostname;
    
    // Se já for um IP, retorna como está
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return connectionString;
    }
    
    // Tenta resolver para IPv4
    try {
      const { address } = await lookup(hostname, { family: 4 });
      url.hostname = address;
      console.log(`✅ Resolvido ${hostname} para IPv4: ${address}`);
      return url.toString();
    } catch (dnsError: any) {
      console.warn(`⚠️ Erro ao resolver DNS para IPv4 (${hostname}):`, dnsError.message);
      // Se falhar, retorna a connection string original
      // O PostgreSQL pode tentar conectar mesmo sem resolução explícita
      return connectionString;
    }
  } catch (error) {
    console.warn("⚠️ Erro ao processar connection string para IPv4, usando original:", error);
    return connectionString;
  }
}

// Resolve hostname para IPv4 antes de criar o Pool (top-level await suportado em ESM)
// Para Supabase, tenta usar pooler primeiro, mas se falhar, usa conexão direta com IPv4
// IMPORTANTE: Railway não suporta IPv6, então sempre força IPv4
let resolvedConnectionString: string;
try {
  const originalUrl = process.env.DATABASE_URL;
  const url = new URL(originalUrl);
  const disablePooler = String(process.env.SUPABASE_DISABLE_POOLER || "false").toLowerCase() === "true";
  
  // Se pooler está desabilitado explicitamente, usa conexão direta com IPv4
  if (disablePooler) {
    console.log("ℹ️  Pooler desabilitado - usando conexão direta com resolução IPv4");
    resolvedConnectionString = await getIPv4ConnectionString(originalUrl);
  }
  // Se já está usando pooler do Supabase, usa diretamente sem resolver DNS
  else if (url.hostname.includes("pooler.supabase.com")) {
    console.log("✅ Usando connection pooler do Supabase diretamente (sem resolução DNS)");
    resolvedConnectionString = originalUrl;
  } 
  // Se for Supabase e não estiver usando pooler, tenta pooler primeiro
  // Se pooler não estiver disponível, usa conexão direta com IPv4
  else if (url.hostname.includes("supabase.co")) {
    console.log("🔧 Detectado Supabase - tentando connection pooler primeiro...");
    const poolerString = convertToPoolerIfSupabase(originalUrl);
    
    // Se a conversão funcionou, usa pooler
    if (poolerString !== originalUrl) {
      console.log("✅ Pooler configurado, mas se falhar, tentará conexão direta");
      resolvedConnectionString = poolerString;
    } else {
      // Se não conseguiu converter, usa conexão direta com IPv4
      console.log("⚠️ Não foi possível configurar pooler, usando conexão direta com IPv4");
      resolvedConnectionString = await getIPv4ConnectionString(originalUrl);
    }
  } 
  // Para outras conexões, tenta resolver DNS normalmente
  else {
    resolvedConnectionString = await getIPv4ConnectionString(originalUrl);
  }
} catch (error) {
  console.warn("⚠️ Erro ao processar connection string, usando conexão direta com IPv4...", error);
  // Em caso de erro, tenta conexão direta com IPv4
  try {
    resolvedConnectionString = await getIPv4ConnectionString(process.env.DATABASE_URL);
  } catch (fallbackError) {
    console.error("❌ Erro crítico ao processar connection string:", fallbackError);
    resolvedConnectionString = process.env.DATABASE_URL;
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

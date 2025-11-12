import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dns from "node:dns";
import { promisify } from "util";

// Força resolução IPv4 primeiro para evitar ENETUNREACH em ambientes sem IPv6 (Railway)
dns.setDefaultResultOrder("ipv4first");

const lookup = promisify(dns.lookup);

if (!process.env.DATABASE_URL) {
  const isDevelopment = process.env.NODE_ENV !== "production";
  const errorMessage = 
    "❌ DATABASE_URL is not defined!\n\n" +
    (isDevelopment 
      ? "Para desenvolvimento local:\n" +
        "  1. Crie o arquivo apps/server/.env\n" +
        "  2. Copie de apps/server/env.example: cp apps/server/env.example apps/server/.env\n" +
        "  3. Configure DATABASE_URL com sua connection string do Supabase ou PostgreSQL\n" +
        "  4. Veja apps/server/DEV_SETUP.md para instruções detalhadas\n"
      : "Para Railway:\n" +
        "  - Adicione DATABASE_URL na seção Variables do seu projeto\n" +
        "  - Veja RAILWAY_SETUP.md para instruções\n"
    );
  throw new Error(errorMessage);
}

// Função para converter connection string do Supabase para usar pooler se necessário
function convertToPoolerIfSupabase(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const hostname = url.hostname;
    
    console.log(`🔍 Analisando hostname: ${hostname}`);
    
    // Se já é um IP ou não é Supabase, retorna como está
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) || !hostname.includes("supabase.co")) {
      console.log(`ℹ️  Não é Supabase ou já é IP, usando connection string original`);
      return connectionString;
    }
    
    // Se já está usando pooler, retorna como está
    if (hostname.includes("pooler")) {
      console.log(`✅ Já está usando pooler do Supabase`);
      return connectionString;
    }
    
    // Extrai project ref APENAS da DATABASE_URL (hostname)
    let projectRef: string | null = null;
    const dbHostMatch = hostname.match(/db\.([^.]+)\.supabase\.co/);
    if (dbHostMatch) {
      projectRef = dbHostMatch[1];
      console.log(`✅ Project ref extraído do hostname: ${projectRef}`);
    }
    
    if (!projectRef) {
      console.warn("⚠️ Não foi possível extrair project ref do hostname da DATABASE_URL");
      console.warn(`   Hostname recebido: ${hostname}`);
      console.warn(`   Usando connection string original`);
      return connectionString;
    }
    
    // Usa pooler na porta 5432 (session mode - suporta prepared statements do Drizzle)
    // Transaction mode (porta 6543) não suporta prepared statements
    // Tenta usar a região do ambiente ou usa us-east-1 como padrão
    const region = process.env.SUPABASE_REGION || "us-east-1";
    
    // Constrói o hostname do pooler
    const poolerHost = `aws-0-${region}.pooler.supabase.com`;
    
    // Constrói o username do pooler
    const originalUsername = url.username;
    const poolerUsername = originalUsername === "postgres" ? `postgres.${projectRef}` : originalUsername;
    
    // Atualiza a URL
    url.hostname = poolerHost;
    url.port = "5432";
    url.username = poolerUsername;
    
    console.log(`\n🔧 Configuração do Pooler:`);
    console.log(`   Project Ref: ${projectRef}`);
    console.log(`   Região: ${region}`);
    console.log(`   Pooler Host: ${poolerHost}`);
    console.log(`   Username Original: ${originalUsername}`);
    console.log(`   Username Pooler: ${poolerUsername}`);
    console.log(`   Porta: 5432 (session mode)`);
    console.log(`\n✅ Connection pooler do Supabase configurado com sucesso!`);
    console.log(`   Session mode suporta prepared statements do Drizzle ORM`);
    console.log(`   Se a conexão falhar, verifique se SUPABASE_REGION está correto no Railway`);
    console.log(`   Regiões comuns: us-east-1, us-west-1, eu-west-1\n`);
    
    return url.toString();
  } catch (error) {
    console.warn("⚠️ Erro ao converter para pooler, usando connectionString original:", error);
    return connectionString;
  }
}

// Função para resolver hostname para IPv4 e modificar a connection string
// Retorna { success: boolean, connectionString: string } para indicar se a resolução foi bem-sucedida
async function getIPv4ConnectionString(connectionString: string): Promise<{ success: boolean; connectionString: string }> {
  try {
    const url = new URL(connectionString);
    const hostname = url.hostname;
    
    // Se já for um IP, retorna como está
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return { success: true, connectionString };
    }
    
    // Tenta resolver para IPv4
    try {
      const { address } = await lookup(hostname, { family: 4 });
      url.hostname = address;
      console.log(`✅ Resolvido ${hostname} para IPv4: ${address}`);
      return { success: true, connectionString: url.toString() };
    } catch (dnsError: any) {
      console.warn(`⚠️ Erro ao resolver DNS para IPv4 (${hostname}):`, dnsError.message);
      // Se falhar, retorna indicando que a resolução não foi bem-sucedida
      // O chamador pode decidir usar pooler como fallback
      return { success: false, connectionString };
    }
  } catch (error) {
    console.warn("⚠️ Erro ao processar connection string para IPv4, usando original:", error);
    return { success: false, connectionString };
  }
}

// Resolve hostname para IPv4 antes de criar o Pool (top-level await suportado em ESM)
// Para Supabase, sempre usa pooler em produção (Railway) para evitar problemas de IPv6
// IMPORTANTE: Railway não suporta IPv6, então sempre força IPv4 ou usa pooler
let resolvedConnectionString: string;
try {
  const originalUrl = process.env.DATABASE_URL;
  const url = new URL(originalUrl);
  const disablePooler = String(process.env.SUPABASE_DISABLE_POOLER || "false").toLowerCase() === "true";
  const isProduction = process.env.NODE_ENV === "production" || process.env.RAILWAY_ENVIRONMENT === "production";
  
  console.log(`\n🚀 Iniciando configuração de conexão com banco de dados...`);
  console.log(`   Ambiente: ${isProduction ? "PRODUÇÃO" : "DESENVOLVIMENTO"}`);
  console.log(`   Pooler desabilitado: ${disablePooler ? "SIM" : "NÃO"}`);
  console.log(`   Hostname original: ${url.hostname}\n`);
  
  // Se já está usando pooler do Supabase, usa diretamente sem resolver DNS
  if (url.hostname.includes("pooler.supabase.com")) {
    console.log("✅ Usando connection pooler do Supabase diretamente (sem resolução DNS)");
    resolvedConnectionString = originalUrl;
  }
  // Se for Supabase
  else if (url.hostname.includes("supabase.co")) {
    // Se pooler está desabilitado, tenta resolver DNS para IPv4 primeiro
    if (disablePooler) {
      console.log("ℹ️  Pooler desabilitado - tentando resolver DNS para IPv4");
      const ipv4Result = await getIPv4ConnectionString(originalUrl);
      if (ipv4Result.success) {
        resolvedConnectionString = ipv4Result.connectionString;
        console.log("✅ DNS resolvido para IPv4 com sucesso");
      } else {
        console.warn("⚠️  Resolução DNS falhou - usando pooler como fallback");
        const poolerString = convertToPoolerIfSupabase(originalUrl);
        if (poolerString !== originalUrl) {
          resolvedConnectionString = poolerString;
        } else {
          console.warn("⚠️  Não foi possível usar pooler, tentando connection string original");
          resolvedConnectionString = originalUrl;
        }
      }
    }
    // Em produção (Railway), tenta pooler primeiro, mas se falhar, usa conexão direta
    else if (isProduction) {
      console.log("🔧 Ambiente de produção detectado - tentando pooler primeiro...");
      const poolerString = convertToPoolerIfSupabase(originalUrl);
      if (poolerString !== originalUrl) {
        resolvedConnectionString = poolerString;
      } else {
        console.warn("⚠️ Não foi possível converter para pooler, usando conexão direta");
        resolvedConnectionString = originalUrl;
      }
    } 
    // Se pooler não está desabilitado e não é produção, tenta pooler primeiro
    else {
      console.log("🔧 Detectado Supabase - tentando connection pooler primeiro...");
      const poolerString = convertToPoolerIfSupabase(originalUrl);
      
      // Se a conversão funcionou, usa pooler
      if (poolerString !== originalUrl) {
        resolvedConnectionString = poolerString;
      } else {
        // Se não conseguiu converter, usa conexão direta com IPv4
        console.log("⚠️ Não foi possível configurar pooler, usando conexão direta com IPv4");
        const ipv4Result = await getIPv4ConnectionString(originalUrl);
        resolvedConnectionString = ipv4Result.connectionString;
      }
    }
  } 
  // Para outras conexões, tenta resolver DNS normalmente
  else {
    console.log("ℹ️  Conexão não é Supabase, resolvendo DNS normalmente");
    const ipv4Result = await getIPv4ConnectionString(originalUrl);
    resolvedConnectionString = ipv4Result.connectionString;
  }
} catch (error) {
  console.warn("\n⚠️ Erro ao processar connection string, tentando fallbacks...", error);
  // Em caso de erro, sempre tenta usar pooler se for Supabase
  try {
    const originalUrl = process.env.DATABASE_URL;
    const url = new URL(originalUrl);
    
    if (url.hostname.includes("supabase.co") && !url.hostname.includes("pooler")) {
      console.log("🔄 Tentando pooler do Supabase como fallback...");
      const poolerString = convertToPoolerIfSupabase(originalUrl);
      if (poolerString !== originalUrl) {
        resolvedConnectionString = poolerString;
      } else {
        resolvedConnectionString = originalUrl;
      }
    } else {
      const ipv4Result = await getIPv4ConnectionString(process.env.DATABASE_URL);
      resolvedConnectionString = ipv4Result.connectionString;
    }
  } catch (fallbackError) {
    console.error("❌ Erro crítico ao processar connection string:", fallbackError);
    resolvedConnectionString = process.env.DATABASE_URL;
  }
}

// Log da connection string final (sem senha)
try {
  const finalUrl = new URL(resolvedConnectionString);
  finalUrl.password = "***";
  console.log(`\n📊 Connection String Final:`);
  console.log(`   ${finalUrl.toString()}`);
  console.log(`   SSL: Habilitado (rejectUnauthorized: false)`);
  console.log(`   IPv4: Forçado (family: 4)`);
  console.log(`   Max connections: 20`);
  console.log(`   Timeout: 60s\n`);
} catch (logError) {
  console.log(`\n📊 Connection String configurada (não foi possível parsear para log)\n`);
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
  // Permitir que conexões sejam reutilizadas mesmo após erros
  allowExitOnIdle: false,
});

// Handler de erro global para o pool
pool.on("error", (err) => {
  console.error("❌ Erro no pool de conexões:", {
    code: err.code,
    message: err.message,
    severity: (err as any).severity,
  });
  // Não encerrar o processo, apenas logar o erro
});

// Handler para quando uma conexão é removida do pool
pool.on("remove", () => {
  console.log("ℹ️  Conexão removida do pool");
});

// Configuração do Drizzle
// Desabilitar prepared statements para evitar problemas com pooler do Supabase
// O pooler pode fechar conexões que estão usando prepared statements
export const db = drizzle(pool, {
  logger: false,
  preparedStatements: false, // Desabilitado para melhor compatibilidade com pooler
});

// Export schemas
export * from "./schema/auth.js";
export * from "./schema/matriculas.js";
export * from "./schema/relatorios.js";
export * from "./schema/sync.js";

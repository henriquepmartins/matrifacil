import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Carrega variáveis de ambiente
// No Railway, as variáveis são fornecidas diretamente pelo sistema
// Em desenvolvimento local, tenta carregar de arquivos .env
if (process.env.NODE_ENV !== "production") {
  const envPath = path.resolve(process.cwd(), "apps/server/.env");
  const localEnvPath = path.resolve(process.cwd(), ".env");
  const envFile = fs.existsSync(envPath) ? envPath : localEnvPath;
  dotenv.config({ path: envFile });
}

// Railway fornece a porta via variável PORT (não $PORT - o $ é apenas convenção de shell)
// Garantir que lemos PORT do ambiente, com fallback para 8080
const getPort = () => {
  // Railway e outras plataformas fornecem PORT diretamente
  if (process.env.PORT) {
    return process.env.PORT;
  }
  return "8080";
};

const envSchema = z.object({
  PORT: z.string().default(getPort()),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  CORS_ORIGIN: z.string().default("http://localhost:3001"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET deve ter pelo menos 32 caracteres"),
  REDIS_URL: z.string().optional(),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_STORAGE_BUCKET: z.string().default("documentos"),
});

function validateEnv() {
  try {
    // Garantir que PORT está definido antes de validar
    const envWithPort = {
      ...process.env,
      PORT: process.env.PORT || getPort(),
    };
    
    return envSchema.parse(envWithPort);
  } catch (error: any) {
    console.error("❌ Erro nas variáveis de ambiente:");
    console.error("");

    if (error?.issues && Array.isArray(error.issues)) {
      const missingVars: string[] = [];
      const invalidVars: string[] = [];
      
      error.issues.forEach((issue: any) => {
        const path = issue.path.join(".");
        const message = issue.message;
        
        if (message.includes("obrigatória") || message.includes("Required")) {
          missingVars.push(path);
          console.error(`  ❌ ${path}: ${message}`);
        } else {
          invalidVars.push(path);
          console.error(`  ⚠️  ${path}: ${message}`);
        }
      });
      
      console.error("");
      
      if (missingVars.length > 0) {
        console.error("📋 Variáveis obrigatórias faltando:");
        missingVars.forEach((varName) => {
          console.error(`   - ${varName}`);
        });
        console.error("");
      }
      
      if (invalidVars.length > 0) {
        console.error("⚠️  Variáveis com valores inválidos:");
        invalidVars.forEach((varName) => {
          console.error(`   - ${varName}`);
        });
        console.error("");
      }
    } else if (error?.message) {
      console.error(`  - ${error.message}`);
    } else {
      console.error(`  - ${String(error)}`);
    }

    if (process.env.NODE_ENV === "production") {
      console.error("🔧 Configure as variáveis de ambiente no Railway:");
      console.error("");
      console.error("Variáveis OBRIGATÓRIAS:");
      console.error("  • DATABASE_URL: URL de conexão com o banco de dados PostgreSQL");
      console.error("  • JWT_SECRET: Chave secreta para JWT (mínimo 32 caracteres)");
      console.error("     Gerar: openssl rand -base64 32");
      console.error("");
      console.error("Variáveis OPCIONAIS:");
      console.error("  • PORT: Porta do servidor (Railway fornece automaticamente via PORT)");
      console.error("  • CORS_ORIGIN: URL do frontend (ex: https://seuapp.vercel.app)");
      console.error("  • REDIS_URL: URL do Redis (opcional, para cache e filas)");
      console.error("  • SUPABASE_URL: URL do projeto Supabase (opcional)");
      console.error("  • SUPABASE_SERVICE_ROLE_KEY: Service Role Key do Supabase (opcional)");
      console.error("  • NODE_ENV: Ambiente (development/test/production, padrão: production)");
      console.error("");
      console.error("💡 Dica: No Railway, vá em Variables e adicione as variáveis necessárias.");
    } else {
      console.error("");
      console.error("📝 Crie o arquivo apps/server/.env com as variáveis necessárias.");
      console.error("   Veja apps/server/.env.example para referência.");
      console.error("");
      console.error("📖 Para instruções detalhadas, consulte: apps/server/DEV_SETUP.md");
      console.error("");
      console.error("🔧 Passos rápidos:");
      console.error("   1. Copie o arquivo de exemplo: cp apps/server/env.example apps/server/.env");
      console.error("   2. Configure DATABASE_URL com sua connection string do Supabase ou PostgreSQL");
      console.error("   3. Gere JWT_SECRET: openssl rand -base64 32");
      console.error("");
    }
    process.exit(1);
  }
}

export const env = validateEnv();

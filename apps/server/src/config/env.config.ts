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

const envSchema = z.object({
  PORT: z.string().default("8080"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  CORS_ORIGIN: z.string().default("http://localhost:3001"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET deve ter pelo menos 32 caracteres"),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error: any) {
    console.error("❌ Erro nas variáveis de ambiente:");

    if (error?.issues && Array.isArray(error.issues)) {
      error.issues.forEach((issue: any) => {
        console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
      });
    } else if (error?.message) {
      console.error(`  - ${error.message}`);
    } else {
      console.error(`  - ${String(error)}`);
    }

    if (process.env.NODE_ENV === "production") {
      console.error("\nConfigure as variáveis de ambiente no Railway:");
      console.error("  - DATABASE_URL: URL de conexão com o banco de dados");
      console.error(
        "  - JWT_SECRET: Chave secreta para JWT (mínimo 32 caracteres)"
      );
      console.error("  - CORS_ORIGIN: URL do frontend (opcional)");
      console.error("  - PORT: Porta do servidor (opcional, padrão: 8080)");
    } else {
      console.error(
        "\nCrie o arquivo apps/server/.env com as variáveis necessárias."
      );
      console.error("Veja apps/server/.env.example para referência.\n");
    }
    process.exit(1);
  }
}

export const env = validateEnv();

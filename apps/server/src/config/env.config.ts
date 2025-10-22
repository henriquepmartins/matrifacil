import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Carrega variáveis de ambiente
// Tenta carregar de apps/server/.env (quando executado da raiz) ou .env (quando executado do diretório do servidor)
const envPath = path.resolve(process.cwd(), "apps/server/.env");
const localEnvPath = path.resolve(process.cwd(), ".env");
const envFile = fs.existsSync(envPath) ? envPath : localEnvPath;
dotenv.config({ path: envFile });

const envSchema = z.object({
  PORT: z.string().default("8080"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória"),
  CORS_ORIGIN: z.string().default("http://localhost:3001"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
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

    console.error(
      "\nCrie o arquivo apps/server/.env com as variáveis necessárias."
    );
    console.error("Veja apps/server/.env.example para referência.\n");
    process.exit(1);
  }
}

export const env = validateEnv();

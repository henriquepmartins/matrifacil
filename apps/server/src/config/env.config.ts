import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), "apps/server/.env") });

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

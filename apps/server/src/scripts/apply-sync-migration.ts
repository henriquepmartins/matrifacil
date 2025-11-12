import { db } from "@matrifacil-/db/index.js";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Aplica a migration 0006_fix_sync_tables.sql
 */
export async function applySyncMigration() {
  try {
    console.log("🔄 Aplicando migration 0006_fix_sync_tables...");

    // Ler o arquivo de migration
    const migrationPath = join(
      __dirname,
      "../../../packages/db/src/migrations/0006_fix_sync_tables.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    // Executar a migration
    // Dividir por statement-breakpoint e executar cada statement
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Executando: ${statement.substring(0, 100)}...`);
        await db.execute(statement as any);
      }
    }

    console.log("✅ Migration 0006_fix_sync_tables aplicada com sucesso!");
    return true;
  } catch (error: any) {
    console.error("❌ Erro ao aplicar migration:", error);
    throw error;
  }
}

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  applySyncMigration()
    .then(() => {
      console.log("✅ Migration aplicada!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Erro:", error);
      process.exit(1);
    });
}


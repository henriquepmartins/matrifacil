import dotenv from "dotenv";
import { resolve } from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Carregar o .env ANTES de tudo
dotenv.config({
  path: resolve(__dirname, "../../apps/web/.env"),
});

// Importar o schema
import { user } from "./src/schema/auth";

async function testConnection() {
  try {
    console.log("🔍 Testando conexão com o banco de dados...\n");

    if (!process.env.DATABASE_URL) {
      throw new Error(
        "❌ DATABASE_URL não está definida!\n" +
          "Verifique se o arquivo apps/web/.env existe e está configurado corretamente."
      );
    }

    console.log("📡 Conectando ao banco de dados...");

    // Criar conexão diretamente aqui
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    const db = drizzle(pool);

    // Tentar fazer uma query simples
    const result = await db.select().from(user).limit(1);

    console.log("✅ Conexão bem-sucedida!");
    console.log(`📊 Total de usuários na tabela: ${result.length}\n`);

    if (result.length > 0) {
      console.log("👤 Exemplo de usuário:", result[0]);
    } else {
      console.log("ℹ️  Nenhum usuário cadastrado ainda.");
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:");
    console.error(error);
    console.log(
      "\n💡 Dica: Verifique se o arquivo .env está configurado corretamente."
    );
    console.log(
      "   Especialmente a variável DATABASE_URL com a senha correta.\n"
    );
    process.exit(1);
  }
}

testConnection();

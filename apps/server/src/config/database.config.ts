import dns from "node:dns";

// Força resolução IPv4 primeiro para evitar ENETUNREACH em ambientes sem IPv6 (Railway)
// Esta configuração deve ser feita ANTES de qualquer importação que use o banco de dados
dns.setDefaultResultOrder("ipv4first");

import { db } from "@matrifacil-/db/index.js";
import { sql } from "drizzle-orm";

export { db };

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error: any) {
    console.error("❌ Erro ao conectar ao banco de dados:", error);
    
    // Mensagens de erro mais específicas
    if (error?.cause?.code === "28P01") {
      console.error("");
      console.error("🔐 Erro de autenticação: Senha incorreta ou usuário inválido");
      console.error("   Verifique se a DATABASE_URL está correta no arquivo .env");
      console.error("   Certifique-se de que a senha está correta e não tem caracteres especiais mal codificados");
      console.error("");
    } else if (error?.cause?.code === "ENOTFOUND" || error?.message?.includes("ENOTFOUND")) {
      console.error("");
      console.error("🌐 Erro de resolução DNS: Hostname não encontrado");
      console.error("   Verifique sua conexão com a internet");
      console.error("   Se estiver usando Supabase, tente:");
      console.error("     1. Adicionar SUPABASE_URL no .env");
      console.error("     2. Ou definir SUPABASE_DISABLE_POOLER=true");
      console.error("");
    } else if (error?.cause?.code === "ECONNREFUSED") {
      console.error("");
      console.error("🔌 Erro de conexão: Servidor recusou a conexão");
      console.error("   Verifique se o banco de dados está rodando");
      console.error("   Verifique se a porta e o host estão corretos na DATABASE_URL");
      console.error("");
    }
    
    return false;
  }
}

export async function initializeDatabase(): Promise<void> {
  console.log("🔌 Conectando ao banco de dados (atualizado)...");
  const isConnected = await checkDatabaseConnection();

  if (!isConnected) {
    throw new Error("Falha ao conectar ao banco de dados");
  }

  console.log("✅ Banco de dados conectado com sucesso!");
}

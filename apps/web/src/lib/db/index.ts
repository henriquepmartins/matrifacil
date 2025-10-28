import { db, MatriFacilDB } from "./schema";

export { db, MatriFacilDB };
export type {
  CachedUser,
  CachedSession,
  SyncQueueItem,
  SyncMetadata,
  CachedAluno,
  CachedResponsavel,
  CachedTurma,
  CachedMatricula,
  CachedDocumento,
  CachedPendencia,
  FileMarker,
} from "./schema";

/**
 * Limpa todos os dados do banco de dados local (IndexedDB)
 * Remove todos os registros de todas as tabelas
 */
export async function clearLocalDatabase(): Promise<void> {
  console.log("🗑️  Limpando banco de dados local...");

  try {
    await Promise.all([
      db.users.clear(),
      db.sessions.clear(),
      db.syncQueue.clear(),
      db.syncMetadata.clear(),
      db.alunos.clear(),
      db.responsaveis.clear(),
      db.turmas.clear(),
      db.matriculas.clear(),
      db.documentos.clear(),
      db.pendencias.clear(),
      db.fileMarkers.clear(),
    ]);

    console.log("✅ Banco de dados local limpo com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao limpar banco de dados local:", error);
    throw error;
  }
}

/**
 * Limpa apenas dados de teste (alunos, responsáveis e matrículas)
 * Mantém usuários e sessões
 */
export async function clearTestData(): Promise<void> {
  console.log("🗑️  Limpando dados de teste...");

  try {
    // Limpar em sequência para evitar problemas de concorrência
    await db.alunos.clear();
    console.log("✅ Alunos limpos");

    await db.responsaveis.clear();
    console.log("✅ Responsáveis limpos");

    await db.matriculas.clear();
    console.log("✅ Matrículas limpas");

    await db.documentos.clear();
    console.log("✅ Documentos limpos");

    await db.pendencias.clear();
    console.log("✅ Pendências limpas");

    console.log("✅ Todos os dados de teste limpos com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao limpar dados de teste:", error);
    // Tentar limpeza usando indexedDB diretamente se falhar
    try {
      if (typeof window !== "undefined" && window.indexedDB) {
        const deleteReq = indexedDB.deleteDatabase("MatriFacilDB");
        deleteReq.onsuccess = () => {
          console.log("✅ Banco deletado via indexedDB");
        };
      }
    } catch (fallbackError) {
      console.error("❌ Erro no fallback:", fallbackError);
    }
    throw error;
  }
}

/**
 * Deleta completamente o banco de dados local
 * Isso remove o banco IndexedDB e cria um novo vazio
 */
export async function deleteLocalDatabase(): Promise<void> {
  console.log("🗑️  Deletando banco de dados local...");

  try {
    await db.close();
    await db.delete();
    console.log("✅ Banco de dados local deletado com sucesso!");

    // Recarrega a página para reinicializar o banco
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  } catch (error) {
    console.error("❌ Erro ao deletar banco de dados local:", error);
    throw error;
  }
}

/**
 * Limpa dados de teste de forma mais agressiva
 * Usa transação para garantir integridade
 */
export async function clearTestDataForce(): Promise<void> {
  console.log("🗑️  Limpando dados de teste (modo forçado)...");

  try {
    // Usar transação para garantir integridade
    await db.transaction(
      "rw",
      [db.alunos, db.responsaveis, db.matriculas, db.documentos, db.pendencias],
      async () => {
        await db.alunos.clear();
        await db.responsaveis.clear();
        await db.matriculas.clear();
        await db.documentos.clear();
        await db.pendencias.clear();
      }
    );

    console.log("✅ Dados de teste limpos com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao limpar dados de teste:", error);
    throw error;
  }
}

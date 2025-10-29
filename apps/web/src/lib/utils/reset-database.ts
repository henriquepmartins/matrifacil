import { db } from "../db";

/**
 * Reseta completamente o banco de dados local IndexedDB
 * Remove TODOS os dados e permite começar do zero
 */
export async function resetDatabase() {
  const confirmation = confirm(
    "⚠️ ATENÇÃO: Isso irá APAGAR TODOS OS DADOS LOCAIS!\n\n" +
    "Isso inclui:\n" +
    "- Todas as pré-matrículas locais\n" +
    "- Todos os alunos locais\n" +
    "- Todos os responsáveis locais\n" +
    "- Todas as matrículas locais\n" +
    "- Documentos e pendências\n" +
    "- Fila de sincronização\n\n" +
    "⚠️ Dados já sincronizados com o servidor NÃO serão afetados.\n" +
    "⚠️ Dados locais que ainda não foram sincronizados SERÃO PERDIDOS.\n\n" +
    "Tem certeza que deseja continuar?"
  );

  if (!confirmation) {
    console.log("❌ Operação cancelada pelo usuário");
    return false;
  }

  try {
    console.log("🗑️ Iniciando reset completo do banco de dados...");
    console.log("=====================================\n");

    // 1. Contar registros antes de apagar
    const counts = {
      responsaveis: await db.responsaveis.count(),
      alunos: await db.alunos.count(),
      matriculas: await db.matriculas.count(),
      turmas: await db.turmas.count(),
      documentos: await db.documentos.count(),
      pendencias: await db.pendencias.count(),
      syncQueue: await db.syncQueue.count(),
      syncMetadata: await db.syncMetadata.count(),
    };

    console.log("📊 Registros encontrados:");
    Object.entries(counts).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`   ${table}: ${count} registros`);
      }
    });
    console.log("");

    // 2. Limpar todas as tabelas
    console.log("🧹 Limpando tabelas...");
    
    await db.syncQueue.clear();
    console.log("   ✅ syncQueue limpa");
    
    await db.syncMetadata.clear();
    console.log("   ✅ syncMetadata limpa");
    
    await db.pendencias.clear();
    console.log("   ✅ pendencias limpa");
    
    await db.documentos.clear();
    console.log("   ✅ documentos limpa");
    
    await db.matriculas.clear();
    console.log("   ✅ matriculas limpa");
    
    await db.alunos.clear();
    console.log("   ✅ alunos limpa");
    
    await db.responsaveis.clear();
    console.log("   ✅ responsaveis limpa");
    
    await db.turmas.clear();
    console.log("   ✅ turmas limpa");

    // 3. Verificar se tudo foi apagado
    console.log("\n📊 Verificando limpeza...");
    const finalCounts = {
      responsaveis: await db.responsaveis.count(),
      alunos: await db.alunos.count(),
      matriculas: await db.matriculas.count(),
      turmas: await db.turmas.count(),
      documentos: await db.documentos.count(),
      pendencias: await db.pendencias.count(),
      syncQueue: await db.syncQueue.count(),
      syncMetadata: await db.syncMetadata.count(),
    };

    const allZero = Object.values(finalCounts).every(count => count === 0);

    if (allZero) {
      console.log("   ✅ Todas as tabelas estão vazias");
    } else {
      console.warn("   ⚠️ Algumas tabelas ainda têm dados:", finalCounts);
    }

    // 4. Calcular totais removidos
    const totalRemoved = Object.values(counts).reduce((sum, count) => sum + count, 0);

    console.log("\n✅ RESET CONCLUÍDO COM SUCESSO!");
    console.log("=====================================");
    console.log(`📊 Total de registros removidos: ${totalRemoved}`);
    console.log("\n💡 Próximos passos:");
    console.log("   1. A página será recarregada automaticamente");
    console.log("   2. Você poderá criar novas pré-matrículas do zero");
    console.log("   3. Dados do servidor permaneceram intactos");
    console.log("   4. Na próxima conexão, dados do servidor serão baixados novamente");

    // 5. Recarregar página após 3 segundos
    setTimeout(() => {
      console.log("\n🔄 Recarregando página...");
      window.location.reload();
    }, 3000);

    return true;
  } catch (error) {
    console.error("❌ Erro ao resetar banco de dados:", error);
    alert("Erro ao resetar banco de dados. Veja o console para mais detalhes.");
    return false;
  }
}

/**
 * Remove apenas dados NÃO sincronizados (pending)
 * Mantém dados já sincronizados
 */
export async function clearPendingOnly() {
  const confirmation = confirm(
    "Remover apenas dados NÃO sincronizados?\n\n" +
    "Isso irá:\n" +
    "- Remover dados com sync_status = 'pending'\n" +
    "- Manter dados já sincronizados (sync_status = 'synced')\n" +
    "- Limpar fila de sincronização\n\n" +
    "Continuar?"
  );

  if (!confirmation) {
    console.log("❌ Operação cancelada");
    return false;
  }

  try {
    console.log("🧹 Limpando apenas dados pendentes...");

    // Contar antes
    const pendingCounts = {
      responsaveis: await db.responsaveis.where("sync_status").equals("pending").count(),
      alunos: await db.alunos.where("sync_status").equals("pending").count(),
      matriculas: await db.matriculas.where("sync_status").equals("pending").count(),
      documentos: await db.documentos.where("sync_status").equals("pending").count(),
      pendencias: await db.pendencias.where("sync_status").equals("pending").count(),
    };

    console.log("📊 Registros pendentes:");
    Object.entries(pendingCounts).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`   ${table}: ${count}`);
      }
    });

    // Remover
    await db.syncQueue.clear();
    await db.responsaveis.where("sync_status").equals("pending").delete();
    await db.alunos.where("sync_status").equals("pending").delete();
    await db.matriculas.where("sync_status").equals("pending").delete();
    await db.documentos.where("sync_status").equals("pending").delete();
    await db.pendencias.where("sync_status").equals("pending").delete();

    const total = Object.values(pendingCounts).reduce((sum, count) => sum + count, 0);
    console.log(`✅ ${total} registros pendentes removidos`);

    setTimeout(() => {
      window.location.reload();
    }, 2000);

    return true;
  } catch (error) {
    console.error("❌ Erro:", error);
    return false;
  }
}

// Disponibilizar globalmente
if (typeof window !== "undefined") {
  (window as any).resetDatabase = resetDatabase;
  (window as any).clearPendingOnly = clearPendingOnly;
  console.log("🛠️ Funções disponíveis no console:");
  console.log("   - resetDatabase() - Apaga TUDO e começa do zero");
  console.log("   - clearPendingOnly() - Remove apenas dados não sincronizados");
}


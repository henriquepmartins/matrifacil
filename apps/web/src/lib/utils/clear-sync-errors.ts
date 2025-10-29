import { db } from "../db";

/**
 * Limpa registros com erros de sincronização do IndexedDB
 * Útil para resolver problemas de loop infinito
 */
export async function clearSyncErrors() {
  console.log("🧹 Limpando registros com erros de sincronização...");
  
  try {
    // 1. Limpar fila de sincronização completamente
    const queueCount = await db.syncQueue.count();
    await db.syncQueue.clear();
    console.log(`✅ Removidos ${queueCount} itens da fila de sincronização`);
    
    // 2. Resetar status de registros com erro
    const tables = [
      { name: "responsaveis", store: db.responsaveis },
      { name: "alunos", store: db.alunos },
      { name: "matriculas", store: db.matriculas },
      { name: "turmas", store: db.turmas },
      { name: "documentos", store: db.documentos },
      { name: "pendencias", store: db.pendencias },
    ];
    
    for (const { name, store } of tables) {
      // Buscar registros com sync_status = "conflict"
      const conflictRecords = await store.where("sync_status").equals("conflict").toArray();
      
      if (conflictRecords.length > 0) {
        console.log(`📝 Encontrados ${conflictRecords.length} registros com conflito em ${name}`);
        
        // Resetar para pending para tentar novamente
        for (const record of conflictRecords) {
          await store.update(record.id, {
            sync_status: "pending",
            error_message: undefined,
          } as any);
        }
        
        console.log(`✅ ${conflictRecords.length} registros de ${name} resetados para "pending"`);
      }
    }
    
    // 3. Limpar metadata de sincronização antiga
    const metadataCount = await db.syncMetadata.count();
    await db.syncMetadata.clear();
    console.log(`✅ Removidos ${metadataCount} registros de metadata`);
    
    console.log("✅ Limpeza concluída com sucesso!");
    
    return {
      success: true,
      queueCleared: queueCount,
      tablesProcessed: tables.length,
    };
  } catch (error) {
    console.error("❌ Erro ao limpar dados de sincronização:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Remove completamente registros locais que não foram sincronizados
 * ATENÇÃO: Isso irá deletar dados locais permanentemente!
 */
export async function clearAllPendingData() {
  if (!confirm("⚠️ ATENÇÃO: Isso irá deletar TODOS os dados locais não sincronizados. Tem certeza?")) {
    return { success: false, message: "Cancelado pelo usuário" };
  }
  
  console.log("🗑️ Removendo dados locais não sincronizados...");
  
  try {
    const tables = [
      { name: "responsaveis", store: db.responsaveis },
      { name: "alunos", store: db.alunos },
      { name: "matriculas", store: db.matriculas },
      { name: "turmas", store: db.turmas },
      { name: "documentos", store: db.documentos },
      { name: "pendencias", store: db.pendencias },
    ];
    
    let totalDeleted = 0;
    
    for (const { name, store } of tables) {
      // Deletar registros com sync_status != "synced"
      const pendingRecords = await store.where("sync_status").notEqual("synced").toArray();
      
      if (pendingRecords.length > 0) {
        console.log(`🗑️ Removendo ${pendingRecords.length} registros pendentes de ${name}`);
        
        for (const record of pendingRecords) {
          await store.delete(record.id);
          totalDeleted++;
        }
      }
    }
    
    // Limpar fila
    await db.syncQueue.clear();
    
    console.log(`✅ ${totalDeleted} registros removidos com sucesso!`);
    
    return {
      success: true,
      totalDeleted,
    };
  } catch (error) {
    console.error("❌ Erro ao remover dados pendentes:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

// Exportar para uso no console do navegador
if (typeof window !== "undefined") {
  (window as any).clearSyncErrors = clearSyncErrors;
  (window as any).clearAllPendingData = clearAllPendingData;
  console.log("🛠️ Funções de limpeza disponíveis:");
  console.log("  - clearSyncErrors() - Limpa erros e reseta status");
  console.log("  - clearAllPendingData() - Remove TODOS os dados locais não sincronizados");
}


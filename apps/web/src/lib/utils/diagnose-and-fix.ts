import { db } from "../db";

/**
 * Diagnostica e corrige problemas de sincronização automaticamente
 */
export async function diagnoseAndFix() {
  console.log("🔍 DIAGNÓSTICO E CORREÇÃO AUTOMÁTICA");
  console.log("=====================================\n");
  
  const report = {
    queueItems: 0,
    conflictRecords: {} as Record<string, number>,
    pendingRecords: {} as Record<string, number>,
    syncedRecords: {} as Record<string, number>,
    actions: [] as string[],
  };
  
  try {
    // 1. Verificar fila de sincronização
    console.log("📋 1. Verificando fila de sincronização...");
    const queueItems = await db.syncQueue.toArray();
    report.queueItems = queueItems.length;
    console.log(`   Itens na fila: ${queueItems.length}`);
    
    if (queueItems.length > 0) {
      console.log("   Primeiros itens:", queueItems.slice(0, 3).map(q => ({
        entity: q.entity,
        operation: q.operation,
        id_local: q.id_local,
      })));
    }
    
    // 2. Verificar registros por tabela
    console.log("\n📊 2. Verificando status dos registros...");
    const tables = [
      { name: "responsaveis", store: db.responsaveis },
      { name: "alunos", store: db.alunos },
      { name: "matriculas", store: db.matriculas },
      { name: "turmas", store: db.turmas },
      { name: "documentos", store: db.documentos },
      { name: "pendencias", store: db.pendencias },
    ];
    
    for (const { name, store } of tables) {
      const all = await store.toArray();
      const conflicts = await store.where("sync_status").equals("conflict").toArray();
      const pending = await store.where("sync_status").equals("pending").toArray();
      const synced = await store.where("sync_status").equals("synced").toArray();
      
      report.conflictRecords[name] = conflicts.length;
      report.pendingRecords[name] = pending.length;
      report.syncedRecords[name] = synced.length;
      
      console.log(`   ${name}: ${all.length} total | ${synced.length} synced | ${pending.length} pending | ${conflicts.length} conflict`);
      
      if (conflicts.length > 0) {
        console.log(`     ⚠️ Conflitos encontrados:`, conflicts.slice(0, 2).map(c => ({
          id: c.id,
          error: (c as any).error_message,
        })));
      }
    }
    
    // 3. Aplicar correções
    console.log("\n🔧 3. Aplicando correções...");
    
    // 3.1. Limpar fila de sincronização
    if (queueItems.length > 0) {
      await db.syncQueue.clear();
      report.actions.push(`Removidos ${queueItems.length} itens da fila de sincronização`);
      console.log(`   ✅ Fila de sincronização limpa (${queueItems.length} itens removidos)`);
    }
    
    // 3.2. Resetar registros com conflito para pending
    let totalResetted = 0;
    for (const { name, store } of tables) {
      const conflicts = await store.where("sync_status").equals("conflict").toArray();
      
      if (conflicts.length > 0) {
        for (const record of conflicts) {
          await store.update(record.id, {
            sync_status: "pending",
            error_message: undefined,
          } as any);
          totalResetted++;
        }
        report.actions.push(`Resetados ${conflicts.length} registros de ${name}`);
        console.log(`   ✅ ${conflicts.length} registros de ${name} resetados para "pending"`);
      }
    }
    
    // 3.3. Limpar metadata antiga
    const metadataCount = await db.syncMetadata.count();
    if (metadataCount > 0) {
      await db.syncMetadata.clear();
      report.actions.push(`Removidos ${metadataCount} registros de metadata`);
      console.log(`   ✅ Metadata limpa (${metadataCount} registros)`);
    }
    
    // 4. Verificar estado final
    console.log("\n📊 4. Estado final:");
    const finalQueue = await db.syncQueue.count();
    console.log(`   Fila de sincronização: ${finalQueue} itens`);
    
    for (const { name, store } of tables) {
      const pending = await store.where("sync_status").equals("pending").count();
      const synced = await store.where("sync_status").equals("synced").count();
      if (pending > 0 || synced > 0) {
        console.log(`   ${name}: ${pending} pending | ${synced} synced`);
      }
    }
    
    console.log("\n✅ CORREÇÃO CONCLUÍDA COM SUCESSO!");
    console.log("=====================================");
    console.log("\n📝 Resumo das ações:");
    report.actions.forEach((action, i) => {
      console.log(`   ${i + 1}. ${action}`);
    });
    
    console.log("\n💡 Próximos passos:");
    console.log("   1. Recarregue a página (F5)");
    console.log("   2. A sincronização automática deve funcionar corretamente agora");
    console.log("   3. Se ainda houver problemas, execute: await clearAllPendingData()");
    
    return report;
  } catch (error) {
    console.error("❌ Erro durante diagnóstico:", error);
    throw error;
  }
}

// Disponibilizar no console
if (typeof window !== "undefined") {
  (window as any).diagnoseAndFix = diagnoseAndFix;
  console.log("🛠️ Função de diagnóstico disponível: diagnoseAndFix()");
}


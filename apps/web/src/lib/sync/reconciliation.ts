import { db } from "../db/index";
import type { BatchItem } from "./batch-builder";

export interface SyncMapping {
  entity: string;
  id_local: string;
  id_global: string;
}

/**
 * Reconcilia dados locais com IDs globais recebidos do servidor
 */
export async function reconcileData(mappings: SyncMapping[]): Promise<void> {
  await db.transaction(
    "rw",
    [
      db.responsaveis,
      db.alunos,
      db.turmas,
      db.matriculas,
      db.documentos,
      db.pendencias,
    ],
    async () => {
      for (const mapping of mappings) {
        const { entity, id_local, id_global } = mapping;

        let store = null;

        switch (entity) {
          case "responsavel":
            store = db.responsaveis;
            break;
          case "aluno":
            store = db.alunos;
            break;
          case "turma":
            store = db.turmas;
            break;
          case "matricula":
            store = db.matriculas;
            break;
          case "documento":
            store = db.documentos;
            break;
          case "pendencia":
            store = db.pendencias;
            break;
        }

        if (!store) {
          console.warn(`Store não encontrado para entidade: ${entity}`);
          continue;
        }

        // Buscar registro local
        const registro = await store.get(id_local);

        if (!registro) {
          console.warn(`Registro ${id_local} não encontrado em ${entity}`);
          continue;
        }

        // Atualizar com ID global e marcar como sincronizado
        await store.update(id_local, {
          idGlobal: id_global,
          sync_status: "synced",
          synced_at: Date.now(),
        } as any);

        console.log(`✅ Reconciliado ${entity} ${id_local} → ${id_global}`);
        
        // Debug: Verificar se o update foi bem-sucedido
        if (entity === "matricula") {
          const verificado = await store.get(id_local);
          console.log(`🔍 Verificação pós-update:`, {
            id_local,
            id_global,
            idGlobal_salvo: verificado?.idGlobal,
            sync_status: verificado?.sync_status,
          });
        }
      }

      // Limpar fila de sincronização
      await db.syncQueue.clear();

      // Registrar última sincronização
      await db.syncMetadata.put({
        key: "last_sync",
        value: Date.now(),
        updatedAt: new Date(),
      });

      console.log(
        `✅ Reconciliação concluída: ${mappings.length} registros atualizados`
      );
    }
  );
}

/**
 * Marca operações como sincronizadas sem reconciliação
 * Usado quando não há mapeamentos retornados
 */
export async function markAsSynced(items: BatchItem[]): Promise<void> {
  for (const item of items) {
    let store = null;

    switch (item.entity) {
      case "responsavel":
        store = db.responsaveis;
        break;
      case "aluno":
        store = db.alunos;
        break;
      case "turma":
        store = db.turmas;
        break;
      case "matricula":
        store = db.matriculas;
        break;
      case "documento":
        store = db.documentos;
        break;
      case "pendencia":
        store = db.pendencias;
        break;
    }

    if (store) {
      await store.update(item.id_local, {
        sync_status: "synced",
        synced_at: Date.now(),
      } as any);
    }
  }
}

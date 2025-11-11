import { db } from "../db/index";
import type { BatchItem } from "./batch-builder";
import type { CachedMatricula } from "../db/index";

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
      // Criar mapa de id_local -> id_global para facilitar resolução de relacionamentos
      const idMapping = new Map<string, string>();
      for (const mapping of mappings) {
        idMapping.set(mapping.id_local, mapping.id_global);
      }

      // Primeiro, processar todas as entidades exceto matrícula para ter os IDs globais disponíveis
      const matriculaMappings: SyncMapping[] = [];

      for (const mapping of mappings) {
        const { entity, id_local, id_global } = mapping;

        // Separar matrículas para processar depois
        if (entity === "matricula") {
          matriculaMappings.push(mapping);
          continue;
        }

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
      }

      // Agora processar matrículas, atualizando também os relacionamentos
      for (const mapping of matriculaMappings) {
        const { entity, id_local, id_global } = mapping;
        const store = db.matriculas;

        // Buscar registro local da matrícula
        const registro = await store.get(id_local) as CachedMatricula | undefined;

        if (!registro) {
          console.warn(`Matrícula ${id_local} não encontrada`);
          continue;
        }

        // Resolver IDs globais dos relacionamentos
        const alunoIdGlobal = idMapping.get(registro.alunoId) || registro.alunoId;
        const responsavelIdGlobal = idMapping.get(registro.responsavelId) || registro.responsavelId;
        const turmaIdGlobal = registro.turmaId ? (idMapping.get(registro.turmaId) || registro.turmaId) : undefined;

        // Atualizar matrícula com ID global e relacionamentos atualizados
        await store.update(id_local, {
          idGlobal: id_global,
          alunoId: alunoIdGlobal,
          responsavelId: responsavelIdGlobal,
          turmaId: turmaIdGlobal,
          sync_status: "synced",
          synced_at: Date.now(),
        } as any);

        console.log(`✅ Reconciliado matrícula ${id_local} → ${id_global}`);
        console.log(`   - alunoId: ${registro.alunoId} → ${alunoIdGlobal}`);
        console.log(`   - responsavelId: ${registro.responsavelId} → ${responsavelIdGlobal}`);
        
        // Debug: Verificar se o update foi bem-sucedido
        const verificado = await store.get(id_local) as CachedMatricula | undefined;
        console.log(`🔍 Verificação pós-update:`, {
          id_local,
          id_global,
          idGlobal_salvo: verificado?.idGlobal,
          alunoId: verificado?.alunoId,
          responsavelId: verificado?.responsavelId,
          sync_status: verificado?.sync_status,
        });
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

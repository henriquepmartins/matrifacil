import { db } from "../db/index";
import type { BatchItem } from "./batch-builder";
import type { CachedMatricula } from "../db/index";

export interface SyncMapping {
  entity: string;
  id_local: string;
  id_global: string;
}

/**
 * Verifica se um object store existe no banco de dados
 */
async function objectStoreExists(storeName: string): Promise<boolean> {
  try {
    if (!db.isOpen()) {
      console.warn(`⚠️ Banco não está aberto ao verificar ${storeName}`);
      return false;
    }
    
    // Tentar acessar o store para verificar se existe
    const store = (db as any)[storeName];
    if (!store) {
      console.warn(`⚠️ Store ${storeName} não encontrado na instância do banco`);
      return false;
    }
    
    // Tentar fazer uma operação simples para verificar se o store existe no IndexedDB
    await store.count();
    return true;
  } catch (error: any) {
    // Se o erro for sobre object store não encontrado, retornar false
    if (
      error?.message?.includes("object store") ||
      error?.message?.includes("not found") ||
      error?.name === "NotFoundError"
    ) {
      console.warn(`⚠️ Object store ${storeName} não existe no banco:`, error.message);
      return false;
    }
    // Outros erros podem ser temporários, assumir que existe
    console.warn(`⚠️ Erro ao verificar ${storeName}, assumindo que existe:`, error.message);
    return true;
  }
}

/**
 * Reconcilia dados locais com IDs globais recebidos do servidor
 */
export async function reconcileData(mappings: SyncMapping[]): Promise<void> {
  // Verificar se o banco está aberto
  if (!db.isOpen()) {
    console.log("🔄 Banco não está aberto, tentando abrir...");
    try {
      await db.open();
      console.log("✅ Banco aberto com sucesso");
    } catch (error: any) {
      console.error("❌ Erro ao abrir banco de dados:", error);
      throw new Error(`Erro ao abrir banco de dados: ${error.message || "Erro desconhecido"}`);
    }
  }

  // Verificar quais object stores existem antes de criar a transação
  console.log("🔍 Verificando object stores disponíveis...");
  const requiredStores = [
    { name: "responsaveis", store: db.responsaveis },
    { name: "alunos", store: db.alunos },
    { name: "turmas", store: db.turmas },
    { name: "matriculas", store: db.matriculas },
    { name: "documentos", store: db.documentos },
    { name: "pendencias", store: db.pendencias },
    { name: "syncQueue", store: db.syncQueue },
    { name: "syncMetadata", store: db.syncMetadata },
  ];

  const availableStores: any[] = [];
  const availableStoreNames = new Set<string>();
  const missingStores: string[] = [];

  for (const { name, store } of requiredStores) {
    const exists = await objectStoreExists(name);
    if (exists) {
      availableStores.push(store);
      availableStoreNames.add(name);
      console.log(`✅ Object store ${name} disponível`);
    } else {
      missingStores.push(name);
      console.warn(`⚠️ Object store ${name} não disponível`);
    }
  }

  // Se não houver stores disponíveis, lançar erro
  if (availableStores.length === 0) {
    const errorMsg = `Nenhum object store disponível. Stores faltando: ${missingStores.join(", ")}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Se houver stores faltando, logar aviso mas continuar com os disponíveis
  if (missingStores.length > 0) {
    console.warn(
      `⚠️ Alguns object stores não estão disponíveis: ${missingStores.join(", ")}. Continuando com os disponíveis.`
    );
  }

  // Obter versão do banco para debug
  try {
    // Tentar obter a versão do banco de diferentes formas
    const dbVersion = (db as any).verno || (db as any)._dbSchema?.version || "desconhecida";
    console.log(`📊 Versão do banco de dados: ${dbVersion}`);
    
    // Logar informações adicionais sobre o banco
    if (typeof window !== "undefined" && window.indexedDB) {
      const dbName = db.name;
      const dbRequest = indexedDB.open(dbName);
      dbRequest.onsuccess = () => {
        const database = dbRequest.result;
        console.log(`📊 Versão real do IndexedDB: ${database.version}`);
        database.close();
      };
    }
  } catch (error) {
    console.warn("⚠️ Não foi possível obter versão do banco:", error);
  }

  console.log(`🔄 Iniciando reconciliação com ${availableStores.length} object stores disponíveis...`);
  console.log(`📦 Total de mappings para processar: ${mappings.length}`);
  console.log(`📋 Entidades nos mappings:`, mappings.map(m => m.entity).join(", "));

  try {
    await db.transaction("rw", availableStores, async () => {
      // Criar mapa de id_local -> id_global para facilitar resolução de relacionamentos
      const idMapping = new Map<string, string>();
      for (const mapping of mappings) {
        idMapping.set(mapping.id_local, mapping.id_global);
      }
      
      console.log(`🗺️ Mapa de IDs criado com ${idMapping.size} entradas`);

      // Primeiro, processar todas as entidades exceto matrícula para ter os IDs globais disponíveis
      const matriculaMappings: SyncMapping[] = [];
      
      console.log("🔄 Processando entidades (exceto matrículas)...");

      for (const mapping of mappings) {
        const { entity, id_local, id_global } = mapping;

        // Separar matrículas para processar depois
        if (entity === "matricula") {
          matriculaMappings.push(mapping);
          continue;
        }
        
        console.log(`  📝 Processando ${entity} ${id_local} → ${id_global}`);

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
      console.log(`🔄 Processando ${matriculaMappings.length} matrícula(s)...`);
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

      // Limpar fila de sincronização (se disponível)
      if (availableStoreNames.has("syncQueue")) {
        console.log("🧹 Limpando fila de sincronização...");
        await db.syncQueue.clear();
        console.log("✅ Fila de sincronização limpa");
      } else {
        console.warn("⚠️ syncQueue não disponível, pulando limpeza");
      }

      // Registrar última sincronização (se disponível)
      if (availableStoreNames.has("syncMetadata")) {
        console.log("📝 Registrando timestamp da última sincronização...");
        await db.syncMetadata.put({
          key: "last_sync",
          value: Date.now(),
          updatedAt: new Date(),
        });
        console.log("✅ Timestamp registrado");
      } else {
        console.warn("⚠️ syncMetadata não disponível, pulando registro");
      }

      console.log(
        `✅ Reconciliação concluída: ${mappings.length} registros atualizados`
      );
    });
  } catch (error: any) {
    // Tratamento específico para erros de object store
    if (
      error?.message?.includes("object store") ||
      error?.message?.includes("not found") ||
      error?.name === "NotFoundError" ||
      error?.message?.includes("The specified object store was not found")
    ) {
      const errorMsg = `Erro de object store não encontrado: ${error.message}. Stores disponíveis: ${availableStores.length}, Stores faltando: ${missingStores.join(", ")}`;
      console.error(`❌ ${errorMsg}`);
      console.error("📋 Detalhes do erro:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        availableStores: availableStores.length,
        missingStores: missingStores,
        dbOpen: db.isOpen(),
        mappingsCount: mappings.length,
      });
      throw new Error(
        `Erro ao acessar object stores do banco de dados. Verifique se o banco está na versão correta. ${error.message}`
      );
    }
    
    // Re-lançar outros erros
    console.error("❌ Erro inesperado na reconciliação:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      dbOpen: db.isOpen(),
      mappingsCount: mappings.length,
    });
    throw error;
  }
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

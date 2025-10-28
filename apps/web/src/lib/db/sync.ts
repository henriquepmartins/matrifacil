import { db, type SyncQueueItem } from "./index";
import { buildSyncBatch } from "../sync/batch-builder";
import { reconcileData } from "../sync/reconciliation";
import type { SyncMapping } from "../sync/reconciliation";
import { API_URL } from "../api-client";

const MAX_RETRIES = 3;

/**
 * Adiciona uma operação na fila de sincronização
 */
export async function addToSyncQueue(
  action: SyncQueueItem["action"],
  table: string,
  data: any
): Promise<void> {
  await db.syncQueue.add({
    action,
    table,
    data,
    timestamp: new Date(),
    synced: false,
    retries: 0,
  });
}

/**
 * Verifica se está online
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Sincroniza operações pendentes com o servidor usando batch
 * Salva os dados no banco de dados (IndexedDB) e depois sincroniza com Supabase
 */
export async function syncPendingOperations(): Promise<{
  success: number;
  failed: number;
}> {
  if (!isOnline()) {
    console.log("📡 Offline - aguardando conexão para sincronizar");
    return { success: 0, failed: 0 };
  }

  try {
    console.log("🔄 Preparando lote de sincronização...");

    // Construir lote de sincronização (coleta dados pendentes do IndexedDB)
    const batch = await buildSyncBatch();

    if (batch.length === 0) {
      console.log("📝 Nenhuma operação pendente para sincronizar");
      return { success: 0, failed: 0 };
    }

    console.log(`📦 Lote preparado com ${batch.length} itens`);

    // Verificar autenticação antes de enviar
    const token = await getAuthToken();
    if (!token) {
      console.error("❌ Usuário não autenticado");
      return { success: 0, failed: batch.length };
    }

    // Enviar lote para o servidor (salva no Supabase)
    const result = await sendBatch(batch);

    console.log(
      `📥 Servidor respondeu: ${result.mappings.length} sucessos, ${result.conflicts.length} conflitos`
    );

    if (result.success && result.mappings.length > 0) {
      // Reconciliar dados locais com IDs globais
      // Atualiza o IndexedDB com os IDs globais recebidos
      await reconcileData(result.mappings);
      console.log(
        `✅ ${result.mappings.length} registros reconciliados e salvos no IndexedDB`
      );
    }

    // Log de resultado final
    console.log(
      `🎉 Sincronização completa: ${result.mappings.length} salvos, ${result.conflicts.length} falhas`
    );

    return {
      success: result.mappings.length,
      failed: result.conflicts.length,
    };
  } catch (error: any) {
    // Se for erro de servidor offline, apenas loga e retorna pacificamente
    if (
      error?.message === "SERVER_OFFLINE" ||
      error?.isServerOffline ||
      error?.name === "TypeError"
    ) {
      console.warn(
        "⚠️ Servidor offline - dados permanecerão salvos localmente"
      );
      return { success: 0, failed: 0 };
    }

    console.error("❌ Erro na sincronização:", error);
    console.error("Detalhes do erro:", error.message, error.stack);

    throw new Error(
      `Erro ao sincronizar: ${error.message || "Erro desconhecido"}`
    );
  }
}

/**
 * Envia um lote de sincronização para o servidor
 */
async function sendBatch(batch: any[]): Promise<{
  success: boolean;
  mappings: SyncMapping[];
  conflicts: any[];
}> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Obter metadata da última sincronização
  const lastSyncMeta = await db.syncMetadata.get("last_sync");
  const lastSync = lastSyncMeta?.value || 0;

  // Obter device ID
  const deviceId = await getDeviceId();

  const payload = {
    batch,
    device_id: deviceId,
    last_sync: lastSync,
    app_version: "1.0.0",
  };

  console.log(
    `📤 Enviando lote com ${batch.length} itens para ${API_URL}/api/sync`
  );

  try {
    const response = await fetch(`${API_URL}/api/sync`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    console.log(
      `✅ Lote sincronizado: ${result.data.mappings.length} sucessos, ${result.data.conflicts.length} conflitos`
    );

    return {
      success: result.success,
      mappings: result.data.mappings || [],
      conflicts: result.data.conflicts || [],
    };
  } catch (error: any) {
    // Se for erro de conexão (servidor offline), lança erro específico para ser tratado upstream
    if (
      error?.message?.includes("Failed to fetch") ||
      error?.code === "ECONNREFUSED" ||
      error?.name === "TypeError"
    ) {
      const serverOfflineError = new Error("SERVER_OFFLINE");
      (serverOfflineError as any).isServerOffline = true;
      throw serverOfflineError;
    }
    throw error;
  }
}

/**
 * Gera ou recupera ID do dispositivo
 */
async function getDeviceId(): Promise<string> {
  const storedDeviceId = await db.syncMetadata.get("device_id");

  if (storedDeviceId) {
    return storedDeviceId.value;
  }

  // Gerar novo device ID
  const deviceId = `device-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  await db.syncMetadata.put({
    key: "device_id",
    value: deviceId,
    updatedAt: new Date(),
  });

  return deviceId;
}

/**
 * Obtém o token de autenticação
 */
async function getAuthToken(): Promise<string | null> {
  const session = await db.sessions.toCollection().first();
  return session?.token || null;
}

/**
 * Limpa itens sincronizados antigos da fila
 */
export async function cleanupSyncQueue(daysOld = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Busca todos os itens e filtra no JavaScript para evitar problemas com boolean no IndexedDB
  const allItems = await db.syncQueue.toArray();
  const oldItems = allItems.filter(
    (item) => item.synced && item.timestamp < cutoffDate
  );

  if (oldItems.length > 0) {
    await db.syncQueue.bulkDelete(oldItems.map((item) => item.id!));
    console.log(
      `🧹 Limpeza: ${oldItems.length} itens antigos removidos da fila`
    );
  }

  return oldItems.length;
}

/**
 * Obtém estatísticas da fila de sincronização
 */
export async function getSyncQueueStats() {
  // Buscar pendentes de todas as entidades
  const [
    syncQueuePending,
    alunosPending,
    responsaveisPending,
    matriculasPending,
    documentosPending,
    pendenciasPending,
  ] = await Promise.all([
    db.syncQueue.where("synced").equals(0).count(),
    db.alunos.where("sync_status").equals("pending").count(),
    db.responsaveis.where("sync_status").equals("pending").count(),
    db.matriculas.where("sync_status").equals("pending").count(),
    db.documentos.where("sync_status").equals("pending").count(),
    db.pendencias.where("sync_status").equals("pending").count(),
  ]);

  const total = syncQueuePending;
  const pending =
    syncQueuePending +
    alunosPending +
    responsaveisPending +
    matriculasPending +
    documentosPending +
    pendenciasPending;

  // Buscar falhas
  const allItems = await db.syncQueue.toArray();
  const failed = allItems.filter(
    (item) => !item.synced && item.retries >= MAX_RETRIES
  ).length;

  return {
    total,
    pending,
    synced: total - pending,
    failed,
  };
}

// setupAutoSync foi movido para SyncManager em sync-manager.ts

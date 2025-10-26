import { db, type SyncQueueItem } from "./index";

const MAX_RETRIES = 3;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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
 * Sincroniza operações pendentes com o servidor
 */
export async function syncPendingOperations(): Promise<{
  success: number;
  failed: number;
}> {
  if (!isOnline()) {
    console.log("📡 Offline - aguardando conexão para sincronizar");
    return { success: 0, failed: 0 };
  }

  // Busca todos os itens e filtra no JavaScript para evitar problemas com boolean no IndexedDB
  const allItems = await db.syncQueue.toArray();
  const pendingItems = allItems.filter(
    (item) => !item.synced && item.retries < MAX_RETRIES
  );

  if (pendingItems.length === 0) {
    return { success: 0, failed: 0 };
  }

  console.log(`🔄 Sincronizando ${pendingItems.length} operações pendentes...`);

  let success = 0;
  let failed = 0;

  for (const item of pendingItems) {
    try {
      await syncItem(item);
      await db.syncQueue.update(item.id!, { synced: true });
      success++;
    } catch (error) {
      failed++;
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      await db.syncQueue.update(item.id!, {
        retries: item.retries + 1,
        error: errorMessage,
      });

      // Se excedeu o número de tentativas, marca como sincronizado para não tentar mais
      if (item.retries + 1 >= MAX_RETRIES) {
        console.error(
          `❌ Falha permanente ao sincronizar item ${item.id}:`,
          errorMessage
        );
        await db.syncQueue.update(item.id!, { synced: true });
      }
    }
  }

  console.log(
    `✅ Sincronização concluída: ${success} sucesso, ${failed} falhas`
  );
  return { success, failed };
}

/**
 * Sincroniza um item individual
 */
async function syncItem(item: SyncQueueItem): Promise<void> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let endpoint = "";
  let method = "";
  let body: any = item.data;

  // Mapeia a operação para o endpoint correto
  switch (item.table) {
    case "users":
      if (item.action === "CREATE") {
        endpoint = "/api/auth/signup";
        method = "POST";
      } else if (item.action === "UPDATE") {
        endpoint = `/api/users/${item.data.id}`;
        method = "PUT";
      } else if (item.action === "DELETE") {
        endpoint = `/api/users/${item.data.id}`;
        method = "DELETE";
      }
      break;
    // Adicione outros casos conforme necessário
    default:
      throw new Error(`Tabela não suportada: ${item.table}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: method !== "DELETE" ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
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
  const total = await db.syncQueue.count();

  // Busca todos os itens e filtra no JavaScript para evitar problemas com boolean no IndexedDB
  const allItems = await db.syncQueue.toArray();
  const pending = allItems.filter((item) => !item.synced).length;
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

/**
 * Configura listeners para sincronização automática
 */
export function setupAutoSync(): () => void {
  const syncInterval = setInterval(() => {
    syncPendingOperations().catch(console.error);
  }, 30000); // Sincroniza a cada 30 segundos

  const onlineHandler = () => {
    console.log("🌐 Conexão restaurada - iniciando sincronização...");
    syncPendingOperations().catch(console.error);
  };

  if (typeof window !== "undefined") {
    window.addEventListener("online", onlineHandler);
  }

  // Retorna função de cleanup
  return () => {
    clearInterval(syncInterval);
    if (typeof window !== "undefined") {
      window.removeEventListener("online", onlineHandler);
    }
  };
}

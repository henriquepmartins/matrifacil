import { syncPendingOperations } from "../db/sync";
import { isOnline } from "../utils/network";

export type SyncSource = "auto" | "manual";

export interface SyncResult {
  success: number;
  failed: number;
}

export type SyncEvent =
  | { type: "sync-start"; source: SyncSource }
  | { type: "sync-complete"; result: SyncResult }
  | { type: "sync-error"; error: Error };

class SyncManager {
  private isSyncing = false;
  private autoSyncEnabled = true;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(event: SyncEvent) => void> = new Set();
  private backoffMs = 0;
  private readonly baseBackoffMs = 15000; // 15s
  private readonly maxBackoffMs = 120000; // 2min

  /**
   * Executa sincronização (com mutex para prevenir execuções simultâneas)
   */
  async sync(source: SyncSource): Promise<SyncResult> {
    // Mutex: prevenir sync simultâneo
    if (this.isSyncing) {
      console.log("⚠️ Sincronização já em andamento, ignorando...");
      return { success: 0, failed: 0 };
    }

    if (!isOnline()) {
      console.log("📡 Offline - não é possível sincronizar");
      return { success: 0, failed: 0 };
    }

    this.isSyncing = true;
    console.log(`🔄 Iniciando sincronização (${source})...`);
    this.emit({ type: "sync-start", source });

    try {
      const result = await syncPendingOperations();
      console.log(
        `✅ Sincronização (${source}) completa: ${result.success} sucessos, ${result.failed} falhas`
      );
      this.emit({ type: "sync-complete", result });
      // Reset backoff no sucesso
      this.backoffMs = 0;
      return result;
    } catch (error) {
      console.error(`❌ Erro na sincronização (${source}):`, error);
      this.emit({ type: "sync-error", error: error as Error });
      // Aumentar backoff (exponencial com teto)
      this.backoffMs = Math.min(
        this.backoffMs === 0 ? this.baseBackoffMs : this.backoffMs * 2,
        this.maxBackoffMs
      );
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Habilita sincronização automática periódica
   */
  enableAutoSync(intervalMs = 30000) {
    this.disableAutoSync();
    this.autoSyncEnabled = true;

    console.log(`⏰ Auto-sync habilitado (intervalo: ${intervalMs}ms)`);

    this.autoSyncInterval = setInterval(() => {
      if (!isOnline() || this.isSyncing) return;

      const delay = this.backoffMs || 0;
      if (delay > 0) {
        console.log(
          `⏳ Aguardando backoff de ${delay}ms antes do próximo auto-sync`
        );
        setTimeout(() => {
          if (isOnline() && !this.isSyncing) {
            this.sync("auto").catch((err) =>
              console.error("Erro no auto-sync:", err)
            );
          }
        }, delay);
      } else {
        this.sync("auto").catch((err) =>
          console.error("Erro no auto-sync:", err)
        );
      }
    }, intervalMs);
  }

  /**
   * Desabilita sincronização automática
   */
  disableAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
      console.log("⏸️ Auto-sync desabilitado");
    }
    this.autoSyncEnabled = false;
  }

  /**
   * Verifica se auto-sync está habilitado
   */
  get isAutoSyncEnabled(): boolean {
    return this.autoSyncEnabled;
  }

  /**
   * Verifica se está sincronizando
   */
  get currentlySyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Registra listener para eventos de sincronização
   */
  on(listener: (event: SyncEvent) => void) {
    this.listeners.add(listener);
  }

  /**
   * Remove listener
   */
  off(listener: (event: SyncEvent) => void) {
    this.listeners.delete(listener);
  }

  /**
   * Emite evento para todos os listeners
   */
  private emit(event: SyncEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Erro ao processar listener:", error);
      }
    });
  }
}

export const syncManager = new SyncManager();

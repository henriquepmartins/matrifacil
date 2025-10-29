"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getSyncQueueStats,
  isOnline as checkOnline,
  ensureDatabaseReady,
} from "../db/sync";
import { syncManager, type SyncSource } from "../sync/sync-manager";

interface SyncStats {
  total: number;
  pending: number;
  synced: number;
  failed: number;
}

interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  stats: SyncStats;
  sync: () => Promise<{ success: number; failed: number }>;
  lastSyncTime: Date | null;
  error: string | null;
}

/**
 * Hook para gerenciar sincronização offline com suporte bidirecional
 */
export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<SyncStats>({
    total: 0,
    pending: 0,
    synced: 0,
    failed: 0,
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Atualiza as estatísticas da fila
   */
  const updateStats = async () => {
    try {
      await ensureDatabaseReady();
      const newStats = await getSyncQueueStats();
      console.log("📊 Stats atualizados:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("❌ Erro ao atualizar estatísticas:", error);
      // Manter stats atuais em caso de erro
    }
  };

  /**
   * Sincroniza operações pendentes manualmente
   */
  const sync = useCallback(async (source: SyncSource = "manual") => {
    if (!checkOnline()) {
      console.log("📡 Offline - não é possível sincronizar agora");
      setError("Não há conexão com a internet");
      return { success: 0, failed: 0 };
    }

    setIsSyncing(true);
    setError(null);

    try {
      const result = await syncManager.sync(source);

      if (result.success > 0) {
        setLastSyncTime(new Date());
        console.log(
          `✅ ${result.success} registros sincronizados e salvos com sucesso!`
        );
      }

      if (result.failed > 0) {
        setError(`${result.failed} operação(ões) falharam na sincronização`);
      } else if (result.success > 0) {
        setError(null);
      }

      // Atualizar estatísticas após sincronização
      await updateStats();

      return result;
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao sincronizar";
      setError(errorMessage);
      console.error("❌ Erro ao sincronizar:", err);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Auto-sync é gerenciado pelo SyncManager agora

  // Configurar listeners de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      updateStats();
      console.log("🌐 Reconectado - auto-sync detectará pendências");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("📡 Desconectado");
    };

    // Estado inicial
    setIsOnline(checkOnline());

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Configurar SyncManager
  useEffect(() => {
    updateStats();

    // Habilitar auto-sync
    syncManager.enableAutoSync(30000);

    // Listener para atualizar stats quando sync completa
    const handleSyncComplete = () => {
      updateStats();
    };

    syncManager.on(handleSyncComplete);

    return () => {
      syncManager.off(handleSyncComplete);
    };
  }, []);

  // Atualizar estatísticas periodicamente
  useEffect(() => {
    const interval = setInterval(updateStats, 10000); // A cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  return {
    isOnline,
    isSyncing,
    stats,
    sync,
    lastSyncTime,
    error,
  };
}

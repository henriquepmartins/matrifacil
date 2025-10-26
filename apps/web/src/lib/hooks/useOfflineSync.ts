"use client";

import { useState, useEffect } from "react";
import {
  syncPendingOperations,
  getSyncQueueStats,
  setupAutoSync,
  isOnline as checkOnline,
} from "../db/sync";

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
  sync: () => Promise<void>;
}

/**
 * Hook para gerenciar sincronização offline
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

  /**
   * Atualiza as estatísticas da fila
   */
  const updateStats = async () => {
    const newStats = await getSyncQueueStats();
    setStats(newStats);
  };

  /**
   * Sincroniza operações pendentes manualmente
   */
  const sync = async () => {
    if (!checkOnline()) {
      console.log("📡 Offline - não é possível sincronizar agora");
      return;
    }

    setIsSyncing(true);
    try {
      await syncPendingOperations();
      await updateStats();
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Configurar listeners de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      updateStats();
    };

    const handleOffline = () => {
      setIsOnline(false);
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

  // Configurar sincronização automática
  useEffect(() => {
    updateStats();
    const cleanup = setupAutoSync();
    return cleanup;
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
  };
}

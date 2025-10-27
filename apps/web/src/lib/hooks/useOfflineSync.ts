"use client";

import { useState, useEffect, useCallback } from "react";
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
    const newStats = await getSyncQueueStats();
    setStats(newStats);
  };

  /**
   * Sincroniza operações pendentes manualmente
   */
  const sync = useCallback(async () => {
    if (!checkOnline()) {
      console.log("📡 Offline - não é possível sincronizar agora");
      setError("Não há conexão com a internet");
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      console.log("🔄 Iniciando sincronização...");

      // Esta função faz TUDO:
      // 1. Coleta dados pendentes do IndexedDB
      // 2. Envia para o servidor (POST /api/sync)
      // 3. Servidor salva no Supabase
      // 4. Recebe IDs globais do servidor
      // 5. Atualiza o IndexedDB com os IDs globais
      // 6. Marca registros como "synced"
      const result = await syncPendingOperations();

      console.log(
        `📊 Resultado: ${result.success} sucessos, ${result.failed} falhas`
      );

      if (result.success > 0) {
        setLastSyncTime(new Date());
        console.log(
          `✅ ${result.success} registros sincronizados e salvos com sucesso!`
        );
      }

      if (result.failed > 0) {
        setError(`${result.failed} operação(ões) falharam na sincronização`);
      } else if (result.success > 0) {
        // Sucesso - limpar erro se existir
        setError(null);
      }

      // Atualizar estatísticas após sincronização
      await updateStats();

      console.log("✅ Sincronização finalizada");
    } catch (err: any) {
      const errorMessage = err?.message || "Erro ao sincronizar";
      setError(errorMessage);
      console.error("❌ Erro ao sincronizar:", err);
      throw err; // Re-throw para o componente lidar com toast
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Sincroniza automaticamente quando online
   */
  useEffect(() => {
    if (isOnline && stats.pending > 0 && !isSyncing) {
      // Aguarda um pouco antes de sincronizar automaticamente
      const timer = setTimeout(() => {
        sync();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, stats.pending, isSyncing, sync]);

  // Configurar listeners de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      updateStats();

      // Auto-sync após reconexão
      setTimeout(async () => {
        const currentStats = await getSyncQueueStats();
        if (currentStats.pending > 0) {
          console.log("🔄 Reconectado - iniciando sincronização automática");
          sync();
        }
      }, 2000);
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
  }, [sync]);

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
    lastSyncTime,
    error,
  };
}

"use client";

import { useState, useEffect } from "react";
import { db } from "../db/index";

export interface SyncStatusInfo {
  pendingAlunos: number;
  pendingResponsaveis: number;
  pendingTurmas: number;
  pendingMatriculas: number;
  pendingDocumentos: number;
  pendingPendencias: number;
  totalPending: number;
}

interface UseSyncStatusReturn {
  status: SyncStatusInfo;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook para obter status detalhado da sincronização
 */
export function useSyncStatus(): UseSyncStatusReturn {
  const [status, setStatus] = useState<SyncStatusInfo>({
    pendingAlunos: 0,
    pendingResponsaveis: 0,
    pendingTurmas: 0,
    pendingMatriculas: 0,
    pendingDocumentos: 0,
    pendingPendencias: 0,
    totalPending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      // Buscar registros pendentes de cada entidade
      const [alunos, responsaveis, turmas, matriculas, documentos, pendencias] =
        await Promise.all([
          db.alunos.filter((a) => a.sync_status === "pending").toArray(),
          db.responsaveis.filter((r) => r.sync_status === "pending").toArray(),
          db.turmas.filter((t) => t.sync_status === "pending").toArray(),
          db.matriculas.filter((m) => m.sync_status === "pending").toArray(),
          db.documentos.filter((d) => d.sync_status === "pending").toArray(),
          db.pendencias.filter((p) => p.sync_status === "pending").toArray(),
        ]);

      const totalPending =
        alunos.length +
        responsaveis.length +
        turmas.length +
        matriculas.length +
        documentos.length +
        pendencias.length;

      setStatus({
        pendingAlunos: alunos.length,
        pendingResponsaveis: responsaveis.length,
        pendingTurmas: turmas.length,
        pendingMatriculas: matriculas.length,
        pendingDocumentos: documentos.length,
        pendingPendencias: pendencias.length,
        totalPending,
      });
    } catch (error) {
      console.error("Erro ao obter status de sincronização:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    // Atualizar a cada 10 segundos
    const interval = setInterval(refresh, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    isLoading,
    refresh,
  };
}

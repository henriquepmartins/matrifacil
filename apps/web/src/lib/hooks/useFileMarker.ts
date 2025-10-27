"use client";

import { useState, useEffect, useCallback } from "react";
import { db, type FileMarker } from "../db/index";
import { toast } from "sonner";
import { isOnline } from "../utils/network";

interface MarkFileOptions {
  matriculaId: string;
  documentoId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

interface UseFileMarkerReturn {
  markFileForUpload: (
    file: File | Blob,
    options: MarkFileOptions
  ) => Promise<void>;
  getPendingFiles: () => Promise<FileMarker[]>;
  getPendingFilesByMatricula: (matriculaId: string) => Promise<FileMarker[]>;
  clearCompletedFiles: () => Promise<number>;
  hasPendingFiles: boolean;
  pendingFilesCount: number;
}

/**
 * Hook para gerenciar marcação de arquivos para upload
 * Não armazena o arquivo em si, apenas metadados
 */
export function useFileMarker(): UseFileMarkerReturn {
  const [pendingFilesCount, setPendingFilesCount] = useState(0);

  /**
   * Marca um arquivo para upload posterior
   */
  const markFileForUpload = useCallback(
    async (file: File | Blob, options: MarkFileOptions): Promise<void> => {
      const { matriculaId, documentoId, fileName, fileSize, fileType } =
        options;

      // Verificar se está online primeiro
      if (isOnline()) {
        toast.info("Você está online - pode fazer upload agora", {
          duration: 3000,
        });
        return;
      }

      try {
        const markerId = crypto.randomUUID();

        const marker: FileMarker = {
          id: markerId,
          matriculaId,
          documentoId,
          fileName,
          fileSize,
          fileType,
          status: "pending",
          markedAt: new Date(),
        };

        await db.fileMarkers.add(marker);

        console.log(`📎 Arquivo marcado para upload: ${fileName}`);
        toast.success("Arquivo marcado para upload quando houver conexão", {
          duration: 4000,
        });

        // Atualizar contador
        const count = await db.fileMarkers
          .where("status")
          .equals("pending")
          .count();
        setPendingFilesCount(count);
      } catch (error: any) {
        console.error("❌ Erro ao marcar arquivo para upload:", error);
        toast.error("Erro ao marcar arquivo para upload");
        throw error;
      }
    },
    []
  );

  /**
   * Obtém lista de arquivos pendentes
   */
  const getPendingFiles = useCallback(async (): Promise<FileMarker[]> => {
    try {
      const files = await db.fileMarkers
        .where("status")
        .equals("pending")
        .toArray();
      return files;
    } catch (error: any) {
      console.error("❌ Erro ao obter arquivos pendentes:", error);
      return [];
    }
  }, []);

  /**
   * Obtém arquivos pendentes de uma matrícula específica
   */
  const getPendingFilesByMatricula = useCallback(
    async (matriculaId: string): Promise<FileMarker[]> => {
      try {
        const files = await db.fileMarkers
          .where("status")
          .equals("pending")
          .and((m) => m.matriculaId === matriculaId)
          .toArray();
        return files;
      } catch (error: any) {
        console.error("❌ Erro ao obter arquivos da matrícula:", error);
        return [];
      }
    },
    []
  );

  /**
   * Limpa arquivos já enviados
   */
  const clearCompletedFiles = useCallback(async (): Promise<number> => {
    try {
      const completedFiles = await db.fileMarkers
        .where("status")
        .equals("completed")
        .toArray();

      if (completedFiles.length > 0) {
        await db.fileMarkers.bulkDelete(completedFiles.map((f) => f.id));
        console.log(`🧹 ${completedFiles.length} arquivos completos removidos`);
      }

      return completedFiles.length;
    } catch (error: any) {
      console.error("❌ Erro ao limpar arquivos completos:", error);
      return 0;
    }
  }, []);

  // Atualizar contador de arquivos pendentes
  useEffect(() => {
    const updateCount = async () => {
      const count = await db.fileMarkers
        .where("status")
        .equals("pending")
        .count();
      setPendingFilesCount(count);
    };

    updateCount();

    // Atualizar a cada 5 segundos
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    markFileForUpload,
    getPendingFiles,
    getPendingFilesByMatricula,
    clearCompletedFiles,
    hasPendingFiles: pendingFilesCount > 0,
    pendingFilesCount,
  };
}

/**
 * Hook para notificar quando há arquivos pendentes e conexão volta
 */
export function useFileMarkerNotification() {
  const { pendingFilesCount, getPendingFiles } = useFileMarker();

  useEffect(() => {
    if (!isOnline() || pendingFilesCount === 0) return;

    const checkFiles = async () => {
      const files = await getPendingFiles();

      if (files.length > 0) {
        toast.info(
          `Você tem ${files.length} arquivo(s) marcado(s) para upload pendente`,
          {
            duration: 5000,
            action: {
              label: "Ver detalhes",
              onClick: () => {
                // TODO: Navegar para página de arquivos pendentes
                console.log("Ver arquivos pendentes");
              },
            },
          }
        );
      }
    };

    // Aguardar 3 segundos após reconexão
    const timer = setTimeout(checkFiles, 3000);
    return () => clearTimeout(timer);
  }, [pendingFilesCount]);
}

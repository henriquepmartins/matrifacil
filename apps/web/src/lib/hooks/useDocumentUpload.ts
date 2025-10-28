"use client";

import { useState, useCallback } from "react";
import { db } from "../db/index";

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
}

interface UseDocumentUploadReturn {
  uploadDocument: (documentId: string, file: File) => Promise<void>;
  uploads: UploadProgress[];
  isUploading: boolean;
  clearCompleted: () => void;
}

/**
 * Hook para gerenciar upload de documentos
 */
export function useDocumentUpload(): UseDocumentUploadReturn {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = useCallback(async (documentId: string, file: File) => {
    const fileName = file.name;

    // Inicializar upload
    setUploads((prev) => [
      ...prev,
      {
        fileName,
        progress: 0,
        status: "pending",
      },
    ]);

    setIsUploading(true);

    try {
      // Criar form data
      const formData = new FormData();
      formData.append("documento", file);

      // Obter token de autenticação
      const session = await db.sessions.toCollection().first();
      const token = session?.token;

      if (!token) {
        throw new Error("Não autenticado");
      }

      // Atualizar status para uploading
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === fileName
            ? { ...u, status: "uploading", progress: 50 }
            : u
        )
      );

      // Fazer upload
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const response = await fetch(`${API_URL}/api/sync/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const result = await response.json();

      // Atualizar documento no IndexedDB
      await db.documentos.update(documentId, {
        arquivoUrl: result.data.url,
        nomeArquivo: fileName,
        tamanhoArquivo: result.data.size,
        status: "anexado",
        sync_status: "pending",
      } as any);

      // Marcar como completo
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === fileName
            ? { ...u, status: "completed", progress: 100 }
            : u
        )
      );

      console.log(`✅ Upload concluído: ${fileName}`);
    } catch (error: any) {
      const errorMessage = error?.message || "Erro ao fazer upload";

      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === fileName
            ? { ...u, status: "failed", error: errorMessage }
            : u
        )
      );

      console.error(`❌ Erro ao fazer upload de ${fileName}:`, error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads((prev) => prev.filter((u) => u.status !== "completed"));
  }, []);

  return {
    uploadDocument,
    uploads,
    isUploading,
    clearCompleted,
  };
}

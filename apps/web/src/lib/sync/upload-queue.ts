import { db } from "../db/index";
import type { CachedDocumento } from "../db/index";

export interface UploadItem {
  documentId: string;
  file: File | Blob;
  fileName: string;
  matriculaId: string;
}

export interface UploadProgress {
  documentId: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

/**
 * Adiciona um arquivo à fila de upload
 */
export async function addToUploadQueue(item: UploadItem): Promise<void> {
  // Validar arquivo
  validateFile(item.file, item.fileName);

  // Buscar documento no IndexedDB
  const documento = await db.documentos.get(item.documentId);

  if (!documento) {
    throw new Error("Documento não encontrado");
  }

  // Criar entrada na fila de upload
  await db.syncQueue.add({
    action: "UPLOAD" as any,
    table: "documento",
    data: {
      documentId: item.documentId,
      fileName: item.fileName,
      matriculaId: item.matriculaId,
    },
    timestamp: new Date(),
    synced: false,
    retries: 0,
  });

  console.log(`📤 Arquivo ${item.fileName} adicionado à fila de upload`);
}

/**
 * Processa a fila de upload
 */
export async function processUploadQueue(): Promise<{
  success: number;
  failed: number;
}> {
  if (!navigator.onLine) {
    console.log("📡 Offline - aguardando conexão para upload");
    return { success: 0, failed: 0 };
  }

  // Buscar itens de upload pendentes
  const allItems = await db.syncQueue.toArray();
  const uploadItems = allItems.filter(
    (item) =>
      (item.action as any) === "UPLOAD" && !item.synced && item.retries < 3
  );

  if (uploadItems.length === 0) {
    return { success: 0, failed: 0 };
  }

  console.log(`📤 Processando ${uploadItems.length} uploads pendentes...`);

  let success = 0;
  let failed = 0;

  for (const item of uploadItems) {
    try {
      await processUploadItem(item);

      await db.syncQueue.update(item.id!, { synced: true });
      success++;
    } catch (error: any) {
      failed++;
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";

      await db.syncQueue.update(item.id!, {
        retries: item.retries + 1,
        error: errorMessage,
      });

      if (item.retries + 1 >= 3) {
        await db.syncQueue.update(item.id!, { synced: true });
        console.error(
          `❌ Falha permanente ao fazer upload do arquivo:`,
          errorMessage
        );
      }
    }
  }

  console.log(`✅ Upload concluído: ${success} sucesso, ${failed} falhas`);
  return { success, failed };
}

/**
 * Processa um item de upload individual
 */
async function processUploadItem(item: any): Promise<void> {
  const { documentId, fileName, matriculaId } = item.data;

  // Aqui você precisa recuperar o arquivo File/Blob original
  // Isso depende de como você está armazenando os arquivos
  // Uma opção é usar IndexedDB com FileReader

  // Por enquanto, vamos fazer um upload fictício
  // Você precisará implementar a lógica real de upload
  const formData = new FormData();
  formData.append("documento", new Blob()); // Substituir com o arquivo real

  const token = await getAuthToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

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

  // Atualizar documento com URL
  await db.documentos.update(documentId, {
    arquivoUrl: result.data.url,
    nomeArquivo: fileName,
    tamanhoArquivo: result.data.size,
    status: "anexado",
  } as any);
}

/**
 * Valida o arquivo antes de adicionar à fila
 */
function validateFile(file: File | Blob, fileName: string): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  const extension = fileName.split(".").pop()?.toLowerCase();
  const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "webp"];

  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error(
      `Tipo de arquivo não permitido. Tipos permitidos: ${allowedExtensions.join(
        ", "
      )}`
    );
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
 * Limpa a fila de upload de itens antigos
 */
export async function cleanupUploadQueue(daysOld = 7): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const allItems = await db.syncQueue.toArray();
  const oldItems = allItems.filter(
    (item) =>
      item.synced &&
      item.timestamp < cutoffDate &&
      (item.action as any) === "UPLOAD"
  );

  if (oldItems.length > 0) {
    await db.syncQueue.bulkDelete(oldItems.map((item) => item.id!));
    console.log(
      `🧹 Limpeza: ${oldItems.length} uploads antigos removidos da fila`
    );
  }

  return oldItems.length;
}

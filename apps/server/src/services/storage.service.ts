import {
  getSupabaseClient,
  getStorageBucket,
} from "../config/supabase.config.js";

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export class StorageService {
  async uploadFile(
    file: Buffer,
    fileName: string,
    folder?: string
  ): Promise<UploadResult> {
    const client = getSupabaseClient();

    if (!client) {
      throw new Error("Supabase não configurado");
    }

    const bucket = getStorageBucket();
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = folder
      ? `${folder}/${timestamp}-${sanitizedFileName}`
      : `${timestamp}-${sanitizedFileName}`;

    const { data, error } = await client.storage
      .from(bucket)
      .upload(path, file, {
        contentType: this.getContentType(fileName),
        upsert: false,
      });

    if (error) {
      console.error("Erro ao fazer upload:", error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Obter URL pública
    const { data: urlData } = client.storage.from(bucket).getPublicUrl(path);

    if (!urlData?.publicUrl) {
      throw new Error("Não foi possível obter URL pública do arquivo");
    }

    return {
      url: urlData.publicUrl,
      path: data.path,
      size: file.length,
    };
  }

  async deleteFile(path: string): Promise<void> {
    const client = getSupabaseClient();

    if (!client) {
      throw new Error("Supabase não configurado");
    }

    const bucket = getStorageBucket();

    const { error } = await client.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Erro ao deletar arquivo:", error);
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  getFileUrl(path: string): string {
    const client = getSupabaseClient();

    if (!client) {
      throw new Error("Supabase não configurado");
    }

    const bucket = getStorageBucket();

    const { data } = client.storage.from(bucket).getPublicUrl(path);

    return data?.publicUrl || "";
  }

  private getContentType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };

    return mimeTypes[extension || ""] || "application/octet-stream";
  }

  async validateFileSize(size: number, maxSizeMB: number = 10): Promise<void> {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (size > maxSizeBytes) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
    }
  }

  async validateFileType(
    fileName: string,
    allowedTypes: string[]
  ): Promise<void> {
    const extension = fileName.split(".").pop()?.toLowerCase();

    if (!extension || !allowedTypes.includes(extension)) {
      throw new Error(
        `Tipo de arquivo não permitido. Tipos permitidos: ${allowedTypes.join(
          ", "
        )}`
      );
    }
  }
}

export const storageService = new StorageService();

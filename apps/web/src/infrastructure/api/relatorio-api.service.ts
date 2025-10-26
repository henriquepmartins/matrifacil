import { apiClient, API_URL } from "@/lib/api-client";
import { db } from "@/lib/db";

export interface GerarRelatorioRequest {
  tipo:
    | "matriculas"
    | "pre_matriculas"
    | "turmas"
    | "documentos"
    | "pendencias"
    | "geral";
  formato: "pdf" | "csv";
  periodo:
    | "hoje"
    | "semana_atual"
    | "mes_atual"
    | "ano_atual"
    | "personalizado";
  dataInicio?: string;
  dataFim?: string;
  campoData: "createdAt" | "dataMatricula";
  status?: string;
  etapa?: string;
  turma?: string;
  search?: string;
}

export interface RelatorioMetadata {
  id: string;
  tipo: string;
  formato: string;
  filtros: any;
  usuarioId: string;
  nomeArquivo: string;
  tamanhoArquivo?: string;
  createdAt: string;
}

export interface ListarRelatoriosResponse {
  data: RelatorioMetadata[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListarRelatoriosApiResponse {
  success: boolean;
  data: ListarRelatoriosResponse;
}

// Function to get auth token (similar to sync.ts implementation)
async function getAuthToken(): Promise<string | null> {
  try {
    const session = await db.sessions.toCollection().first();
    
    if (!session || !session.token) {
      return null;
    }

    // Verifica se a sessão expirou
    if (session.expiresAt && session.expiresAt < new Date()) {
      await db.sessions.delete(session.id);
      await db.users.clear();
      return null;
    }

    return session.token;
  } catch (error) {
    console.error("Erro ao obter token:", error);
    return null;
  }
}

export class RelatorioApiService {
  static async gerarRelatorio(request: GerarRelatorioRequest): Promise<Blob> {
    try {
      // Verifica se existe uma sessão válida antes de fazer a requisição
      const session = await db.sessions.toCollection().first();
      
      if (!session || !session.token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      if (session.expiresAt && session.expiresAt < new Date()) {
        await db.sessions.clear();
        await db.users.clear();
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Build URL and headers
      const url = `${API_URL}/api/relatorios/gerar`;
      const token = session.token;
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(request),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Se for erro de autenticação, limpa o cache
        if (response.status === 401) {
          await db.sessions.clear();
          await db.users.clear();
          throw new Error("Sessão inválida. Por favor, faça login novamente.");
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // Return the response as blob
      return await response.blob();
    } catch (error: any) {
      console.error("Erro ao gerar relatório:", error);
      throw new Error(error?.message || "Falha ao gerar relatório");
    }
  }

  static async listarRelatoriosGerados(
    limit: number = 10,
    offset: number = 0
  ): Promise<ListarRelatoriosResponse> {
    try {
      // Verifica se existe uma sessão válida antes de fazer a requisição
      const session = await db.sessions.toCollection().first();
      
      if (!session || !session.token) {
        throw new Error("Sessão não encontrada. Faça login novamente.");
      }

      if (session.expiresAt && session.expiresAt < new Date()) {
        await db.sessions.clear();
        await db.users.clear();
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      const response = await apiClient.get<ListarRelatoriosApiResponse>(
        `/api/relatorios/historico?limit=${limit}&offset=${offset}`
      );

      return response.data;
    } catch (error: any) {
      console.error("Erro ao listar relatórios:", error);
      
      // Se for erro de autenticação, redireciona para login
      if (error?.statusCode === 401 || error?.message?.includes("Token")) {
        await db.sessions.clear();
        await db.users.clear();
        throw new Error("Sessão inválida. Por favor, faça login novamente.");
      }
      
      throw new Error(error?.message || "Falha ao listar relatórios");
    }
  }

  static downloadFile(blob: Blob, filename: string): void {
    // Safety check: ensure blob is actually a Blob object
    if (!(blob instanceof Blob)) {
      console.error("Invalid blob object passed to downloadFile:", blob);
      throw new Error("Invalid blob object for download");
    }

    // Additional safety check for browser compatibility
    if (typeof window === 'undefined' || !window.URL) {
      console.error("URL API not available in this environment");
      throw new Error("Download not supported in this environment");
    }

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
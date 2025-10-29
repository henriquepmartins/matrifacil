import { db } from "./db";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Obtém o token de autenticação do cache local
   */
  private async getAuthToken(): Promise<string | null> {
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

  /**
   * Faz uma requisição HTTP
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Headers padrão
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    // Adiciona token de autenticação se disponível
    const token = await this.getAuthToken();
    if (token && token.trim() !== "") {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...config,
        headers,
        credentials: "include", // Inclui cookies
      });

      // Tenta parsear a resposta como JSON
      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Se for erro de autenticação, limpa o cache
        if (response.status === 401) {
          try {
            await db.sessions.clear();
            await db.users.clear();
          } catch (clearError) {
            console.error("Erro ao limpar cache:", clearError);
          }
        }

        throw new APIError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      // Erro de rede ou outro erro
      throw new APIError(
        error instanceof Error ? error.message : "Erro ao fazer requisição",
        0,
        null
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }
}

/**
 * Classe de erro customizada para a API
 */
export class APIError extends Error {
  constructor(message: string, public statusCode: number, public data: any) {
    super(message);
    this.name = "APIError";
  }
}

/**
 * Instância singleton do cliente de API
 */
export const apiClient = new APIClient(API_URL);

/**
 * Verifica o health do servidor
 */
export async function checkHealth(): Promise<{
  success: boolean;
  status: string;
  checks: { database: string; server: string };
}> {
  return apiClient.get("/health");
}

// ============== Turmas API ==============

export interface TurmaDetalhes {
  turma: {
    id: string;
    idGlobal: string;
    nome: string;
    etapa: string;
    turno: string;
    capacidade: number;
    vagasDisponiveis: number;
    anoLetivo: string;
    ativa: boolean;
    createdAt: string;
    updatedAt: string;
  };
  alunos: Array<{
    matriculaId: string;
    protocoloLocal: string;
    statusMatricula: string;
    dataMatricula: string | null;
    alunoId: string;
    alunoNome: string;
    dataNascimento: string;
    etapa: string;
    necessidadesEspeciais: boolean;
    observacoesAluno: string | null;
    responsavelId: string;
    responsavelNome: string;
    responsavelTelefone: string;
    responsavelCpf: string;
    responsavelEndereco: string | null;
    responsavelBairro: string | null;
    responsavelEmail: string | null;
    responsavelParentesco: string | null;
    responsavelAutorizadoRetirada: boolean | null;
  }>;
  estatisticas: {
    totalAlunos: number;
    vagasOcupadas: number;
    vagasDisponiveis: number;
    capacidadeTotal: number;
    taxaOcupacao: number;
    alunosComNecessidadesEspeciais: number;
    percentualNecessidadesEspeciais: string;
  };
}

export interface TransferirAlunoRequest {
  matriculaId: string;
  turmaOrigemId: string;
  turmaDestinoId: string;
}

export interface TransferirAlunoResponse {
  success: boolean;
  message: string;
  data: {
    matriculaId: string;
    turmaOrigem: {
      id: string;
      nome: string;
    };
    turmaDestino: {
      id: string;
      nome: string;
    };
  };
}

/**
 * Busca detalhes completos de uma turma incluindo alunos e estatísticas
 */
export async function getTurmaDetalhes(
  turmaId: string
): Promise<{ success: boolean; data: TurmaDetalhes }> {
  return apiClient.get(`/api/turmas/${turmaId}/detalhes`);
}

/**
 * Transfere um aluno de uma turma para outra
 */
export async function transferirAluno(
  request: TransferirAlunoRequest
): Promise<TransferirAlunoResponse> {
  return apiClient.post("/api/turmas/transferir-aluno", request);
}

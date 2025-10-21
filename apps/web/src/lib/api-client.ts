import { db } from "./db";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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
      return session?.token || null;
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
    if (token) {
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

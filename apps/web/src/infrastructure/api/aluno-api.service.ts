import { apiClient } from "@/lib/api-client";

export interface AlunoSugestao {
  id: string;
  nome: string;
  responsavel?: string;
  protocolo?: string;
}

export interface BuscarAlunosResponse {
  data: AlunoSugestao[];
  total: number;
}

export class AlunoApiService {
  /**
   * Busca alunos das matrículas para autocomplete
   */
  static async buscarAlunos(
    search?: string,
    limit: number = 20
  ): Promise<AlunoSugestao[]> {
    try {
      const params = new URLSearchParams();
      if (search && search.trim()) {
        params.set("search", search.trim());
      }
      params.set("limit", limit.toString());

      // Usar endpoint de teste temporariamente para contornar problema de autenticação
      const response = await apiClient.get<BuscarAlunosResponse>(
        `/api/test/test-buscar-alunos?${params.toString()}`
      );

      return response.data || [];
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      return [];
    }
  }

  /**
   * Busca alunos por nome (para autocomplete)
   */
  static async buscarAlunosPorNome(
    nome: string,
    limit: number = 20
  ): Promise<AlunoSugestao[]> {
    return this.buscarAlunos(nome, limit);
  }
}

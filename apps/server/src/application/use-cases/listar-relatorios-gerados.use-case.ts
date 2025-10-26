import type { RelatorioRepository } from "../../domain/repositories/relatorio.repository.js";
import type {
  ListarRelatoriosRequestDto,
  ListarRelatoriosResponseDto,
} from "../dto/relatorio.dto.js";
import { AppError } from "../../middlewares/error.middleware.js";

export class ListarRelatoriosGeradosUseCase {
  constructor(private readonly relatorioRepository: RelatorioRepository) {}

  async execute(
    request: ListarRelatoriosRequestDto,
    usuarioId: string
  ): Promise<ListarRelatoriosResponseDto> {
    try {
      const [relatorios, total] = await Promise.all([
        this.relatorioRepository.findRecentReports(
          usuarioId,
          request.limit,
          request.offset
        ),
        this.relatorioRepository.countReports(usuarioId),
      ]);

      return {
        data: relatorios,
        total,
        limit: request.limit,
        offset: request.offset,
      };
    } catch (error) {
      throw new AppError(
        500,
        "Erro interno ao listar relatórios",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }
}

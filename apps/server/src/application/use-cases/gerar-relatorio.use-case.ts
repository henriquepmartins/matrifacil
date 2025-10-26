import type { RelatorioRepository } from "../../domain/repositories/relatorio.repository.js";
import { RelatorioEntity } from "../../domain/entities/relatorio.entity.js";
import { RelatorioFiltrosValueObject } from "../../domain/value-objects/relatorio-filtros.value-object.js";
import type { PdfGeneratorService } from "../../infrastructure/services/pdf-generator.service.js";
import type { CsvGeneratorService } from "../../infrastructure/services/csv-generator.service.js";
import type {
  GerarRelatorioRequestDto,
  GerarRelatorioResponseDto,
} from "../dto/relatorio.dto.js";
import { AppError } from "../../middlewares/error.middleware.js";
import { randomUUID } from "crypto";

export class GerarRelatorioUseCase {
  constructor(
    private readonly relatorioRepository: RelatorioRepository,
    private readonly pdfGenerator: PdfGeneratorService,
    private readonly csvGenerator: CsvGeneratorService
  ) {}

  async execute(
    request: GerarRelatorioRequestDto,
    usuarioId: string
  ): Promise<GerarRelatorioResponseDto> {
    try {
      // Validar e processar filtros
      const filtrosVO = new RelatorioFiltrosValueObject({
        periodo: request.periodo,
        dataInicio: request.dataInicio,
        dataFim: request.dataFim,
        campoData: request.campoData,
        status: request.status,
        etapa: request.etapa,
        turma: request.turma,
        search: request.search,
      });

      // Buscar dados do relatório
      const data = await this.relatorioRepository.getReportData(
        request.tipo,
        filtrosVO.filtros
      );

      // Validar limite de dados
      if (data.length > 1000) {
        throw new AppError(
          400,
          "Relatório muito grande. Máximo de 1000 registros permitido. Use filtros mais específicos."
        );
      }

      // Gerar arquivo
      const nomeArquivo = this.generateFileName(request.tipo, request.formato);
      let buffer: Buffer;
      let contentType: string;

      if (request.formato === "pdf") {
        buffer = await this.pdfGenerator.generateReport(
          request.tipo,
          data,
          filtrosVO.filtros
        );
        contentType = "application/pdf";
      } else {
        buffer = await this.csvGenerator.generateReport(
          request.tipo,
          data,
          filtrosVO.filtros
        );
        contentType = "text/csv";
      }

      // Salvar metadata do relatório
      const relatorioId = randomUUID();
      const relatorioEntity = RelatorioEntity.create(
        relatorioId,
        request.tipo,
        request.formato,
        filtrosVO.filtros,
        usuarioId,
        nomeArquivo,
        buffer.length.toString()
      );

      await this.relatorioRepository.saveMetadata(relatorioEntity);

      return {
        buffer,
        nomeArquivo,
        contentType,
        tamanhoArquivo: buffer.length,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        500,
        "Erro interno ao gerar relatório",
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  private generateFileName(tipo: string, formato: string): string {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    const tipoNome = this.getTipoNome(tipo);
    return `relatorio_${tipoNome}_${timestamp}.${formato}`;
  }

  private getTipoNome(tipo: string): string {
    const nomes = {
      matriculas: "matriculas",
      pre_matriculas: "pre_matriculas",
      turmas: "turmas",
      documentos: "documentos",
      pendencias: "pendencias",
      geral: "geral",
    };

    return nomes[tipo as keyof typeof nomes] || tipo;
  }
}

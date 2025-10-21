import { Request, Response } from "express";
import { GerarRelatorioUseCase } from "../../application/use-cases/gerar-relatorio.use-case.js";
import { ListarRelatoriosGeradosUseCase } from "../../application/use-cases/listar-relatorios-gerados.use-case.js";
import {
  GerarRelatorioRequestSchema,
  ListarRelatoriosRequestSchema,
} from "../../application/dto/relatorio.dto.js";
import { AppError } from "../../middlewares/error.middleware.js";

export class RelatorioController {
  constructor(
    private readonly gerarRelatorioUseCase: GerarRelatorioUseCase,
    private readonly listarRelatoriosUseCase: ListarRelatoriosGeradosUseCase
  ) {}

  async gerarRelatorio(req: Request, res: Response): Promise<void> {
    try {
      // Validar dados de entrada
      const validatedData = GerarRelatorioRequestSchema.parse(req.body);

      // Obter ID do usuário do token (assumindo que está disponível no req.user)
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        throw new AppError(401, "Usuário não autenticado");
      }

      // Executar use case
      const result = await this.gerarRelatorioUseCase.execute(
        validatedData,
        usuarioId
      );

      // Configurar headers para download
      res.setHeader("Content-Type", result.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.nomeArquivo}"`
      );
      res.setHeader("Content-Length", result.tamanhoArquivo.toString());

      // Enviar arquivo
      res.send(result.buffer);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({
          success: false,
          message: "Dados inválidos",
          errors: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Erro interno do servidor",
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }
  }

  async listarRelatorios(req: Request, res: Response): Promise<void> {
    try {
      // Validar parâmetros de query
      const validatedData = ListarRelatoriosRequestSchema.parse({
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      });

      // Obter ID do usuário do token
      const usuarioId = (req as any).user?.id;
      if (!usuarioId) {
        throw new AppError(401, "Usuário não autenticado");
      }

      // Executar use case
      const result = await this.listarRelatoriosUseCase.execute(
        validatedData,
        usuarioId
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      } else if (error instanceof Error && error.name === "ZodError") {
        res.status(400).json({
          success: false,
          message: "Parâmetros inválidos",
          errors: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Erro interno do servidor",
          error: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }
  }
}

import { Request, Response } from "express";
import { CreatePreMatriculaUseCase } from "../../application/use-cases/create-pre-matricula.use-case";
import { ConvertToMatriculaCompletaUseCase } from "../../application/use-cases/convert-to-matricula-completa.use-case";
import { GetMatriculasUseCase } from "../../application/use-cases/get-matriculas.use-case";
import { ApproveMatriculaUseCase } from "../../application/use-cases/approve-matricula.use-case";

export class MatriculaController {
  constructor(
    private createPreMatriculaUseCase: CreatePreMatriculaUseCase,
    private convertToMatriculaCompletaUseCase: ConvertToMatriculaCompletaUseCase,
    private getMatriculasUseCase: GetMatriculasUseCase,
    private approveMatriculaUseCase: ApproveMatriculaUseCase
  ) {}

  async createPreMatricula(req: Request, res: Response): Promise<void> {
    try {
      const data = {
        ...req.body,
        aluno: {
          ...req.body.aluno,
          dataNascimento: req.body.aluno?.dataNascimento
            ? new Date(req.body.aluno.dataNascimento)
            : undefined,
        },
      };

      const result = await this.createPreMatriculaUseCase.execute(data);

      res.status(201).json({
        success: true,
        data: result.matricula,
        message: "Pré-matrícula criada com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao criar pré-matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async convertToMatriculaCompleta(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { turmaId, dataMatricula, documentosIniciais } = req.body;

      const result = await this.convertToMatriculaCompletaUseCase.execute({
        matriculaId: id,
        turmaId,
        dataMatricula: dataMatricula ? new Date(dataMatricula) : undefined,
      });

      res.json({
        success: true,
        data: result.matricula,
        message: "Pré-matrícula convertida para matrícula completa com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao converter pré-matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async getMatriculas(req: Request, res: Response): Promise<void> {
    try {
      const { status, etapa, search, limit, offset } = req.query;

      const result = await this.getMatriculasUseCase.execute({
        status: status as string,
        etapa: etapa as string,
        search: search as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({
        success: true,
        data: result.matriculas,
        total: result.total,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao buscar matrículas",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  async approveMatricula(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const result = await this.approveMatriculaUseCase.execute({
        matriculaId: id,
      });

      res.json({
        success: true,
        data: result.matricula,
        message: "Matrícula aprovada com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erro ao aprovar matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}

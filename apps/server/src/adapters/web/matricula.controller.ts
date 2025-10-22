import type { Request, Response } from "@types/express";
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

      console.log("🎯 Convertendo pré-matrícula:", {
        id,
        turmaId,
        dataMatricula,
        documentosIniciais,
      });

      if (!id) {
        res.status(400).json({
          success: false,
          message: "ID da pré-matrícula é obrigatório",
        });
        return;
      }

      const result = await this.convertToMatriculaCompletaUseCase.execute({
        matriculaId: id,
        turmaId,
        dataMatricula: dataMatricula ? new Date(dataMatricula) : undefined,
      });

      console.log("✅ Matrícula convertida com sucesso:", result.matricula.id);

      res.json({
        success: true,
        data: result.matricula,
        message: "Pré-matrícula convertida para matrícula completa com sucesso",
      });
    } catch (error) {
      console.error("❌ Erro ao converter pré-matrícula:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      let statusCode = 500;

      // Determinar código de status apropriado
      if (errorMessage.includes("não encontrada")) {
        statusCode = 404;
      } else if (errorMessage.includes("Apenas pré-matrículas")) {
        statusCode = 400;
      } else if (errorMessage.includes("Nenhuma turma disponível")) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorMessage,
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
      const { turmaId } = req.body;

      const result = await this.approveMatriculaUseCase.execute({
        matriculaId: id,
        turmaId,
      });

      res.json({
        success: true,
        data: result.matricula,
        message: "Matrícula aprovada com sucesso",
      });
    } catch (error) {
      console.error("❌ Erro ao aprovar matrícula:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      let statusCode = 500;

      // Determinar código de status apropriado
      if (errorMessage.includes("não encontrada")) {
        statusCode = 404;
      } else if (errorMessage.includes("já está aprovada")) {
        statusCode = 400;
      } else if (errorMessage.includes("Nenhuma turma disponível")) {
        statusCode = 400;
      } else if (errorMessage.includes("não possui vagas")) {
        statusCode = 400;
      } else if (errorMessage.includes("não está ativa")) {
        statusCode = 400;
      } else if (errorMessage.includes("não é compatível")) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: errorMessage,
      });
    }
  }
}

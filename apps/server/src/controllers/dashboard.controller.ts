import { Request, Response } from "express";
import { preMatriculaService } from "../services/pre-matricula.service.js";
import { AppError } from "../middlewares/error.middleware.js";

// Dados mock para demonstração (mantidos para outras funcionalidades)
const mockStats = {
  totalMatriculas: 156,
  preMatriculas: 23,
  documentosPendentes: 8,
  vagasDisponiveis: 12,
};

const mockMatriculasRecentes = [
  {
    id: "1",
    protocolo: "MAT-2024-001",
    aluno: "João Silva Santos",
    responsavel: "Maria Silva",
    status: "completo",
    data: "2024-01-15",
  },
  {
    id: "2",
    protocolo: "MAT-2024-002",
    aluno: "Ana Costa Lima",
    responsavel: "Pedro Costa",
    status: "pendente_doc",
    data: "2024-01-14",
  },
  {
    id: "3",
    protocolo: "MAT-2024-003",
    aluno: "Carlos Oliveira",
    responsavel: "Sandra Oliveira",
    status: "pre",
    data: "2024-01-13",
  },
  {
    id: "4",
    protocolo: "MAT-2024-004",
    aluno: "Mariana Ferreira",
    responsavel: "Roberto Ferreira",
    status: "concluido",
    data: "2024-01-12",
  },
  {
    id: "5",
    protocolo: "MAT-2024-005",
    aluno: "Lucas Rodrigues",
    responsavel: "Patricia Rodrigues",
    status: "completo",
    data: "2024-01-11",
  },
];

const mockTurmas = [
  {
    id: "1",
    nome: "Berçário A",
    etapa: "bercario",
    turno: "integral",
    capacidade: 15,
    vagasDisponiveis: 3,
    anoLetivo: "2024",
    ativa: true,
    alunos: 12,
  },
  {
    id: "2",
    nome: "Maternal A",
    etapa: "maternal",
    turno: "manha",
    capacidade: 20,
    vagasDisponiveis: 5,
    anoLetivo: "2024",
    ativa: true,
    alunos: 15,
  },
  {
    id: "3",
    nome: "Maternal B",
    etapa: "maternal",
    turno: "tarde",
    capacidade: 20,
    vagasDisponiveis: 0,
    anoLetivo: "2024",
    ativa: true,
    alunos: 20,
  },
];

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 500));

    res.json({
      success: true,
      data: mockStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar estatísticas do dashboard",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

export const getMatriculasRecentes = async (req: Request, res: Response) => {
  try {
    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 300));

    res.json({
      success: true,
      data: mockMatriculasRecentes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar matrículas recentes",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

export const getMatriculas = async (req: Request, res: Response) => {
  try {
    const { status, etapa, search, limit, offset } = req.query;
    const filters = {
      status: status as string,
      etapa: etapa as string,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    const result = await preMatriculaService.getMatriculas(filters);

    res.json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar matrículas",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

export const getPreMatriculas = async (req: Request, res: Response) => {
  try {
    const { status, etapa, search, limit, offset } = req.query;

    const filters = {
      status: status as string,
      etapa: etapa as string,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    };

    const result = await preMatriculaService.getPreMatriculas(filters);

    res.json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao buscar pré-matrículas",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const createPreMatricula = async (req: Request, res: Response) => {
  try {
    // Converter string de data para Date se necessário
    const data = {
      ...req.body,
      aluno: {
        ...req.body.aluno,
        dataNascimento: req.body.aluno?.dataNascimento
          ? new Date(req.body.aluno.dataNascimento)
          : undefined,
      },
    };

    const preMatricula = await preMatriculaService.createPreMatricula(data);

    res.status(201).json({
      success: true,
      data: preMatricula,
      message: "Pré-matrícula criada com sucesso",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao criar pré-matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const getPreMatriculaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const preMatricula = await preMatriculaService.getPreMatriculaById(id);

    res.json({
      success: true,
      data: preMatricula,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao buscar pré-matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const updatePreMatricula = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const preMatricula = await preMatriculaService.updatePreMatricula(
      id,
      req.body
    );

    res.json({
      success: true,
      data: preMatricula,
      message: "Pré-matrícula atualizada com sucesso",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao atualizar pré-matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const deletePreMatricula = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await preMatriculaService.deletePreMatricula(id);

    res.json({
      success: true,
      message: "Pré-matrícula deletada com sucesso",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao deletar pré-matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const convertPreMatricula = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { turmaId, dataMatricula, documentosIniciais } = req.body;
    const preMatricula = await preMatriculaService.convertToMatriculaCompleta(
      id,
      turmaId,
      dataMatricula ? new Date(dataMatricula) : undefined,
      documentosIniciais
    );

    res.json({
      success: true,
      data: preMatricula,
      message: "Pré-matrícula convertida para matrícula completa com sucesso",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao converter pré-matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

// Novo: criar matrícula a partir de uma pré com payload mais completo
export const createMatriculaFromPre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // id da pré
    const { turmaId, dataMatricula, documentosIniciais } = req.body;

    const result = await preMatriculaService.convertToMatriculaCompleta(
      id,
      turmaId,
      dataMatricula ? new Date(dataMatricula) : undefined,
      documentosIniciais
    );

    res.status(201).json({
      success: true,
      data: result,
      message: "Matrícula criada a partir da pré-matrícula",
    });
  } catch (error) {
    if (error instanceof AppError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao criar matrícula a partir da pré",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const getTurmas = async (req: Request, res: Response) => {
  try {
    const { etapa, turno, search, limit, offset } = req.query;

    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 400));

    let filtered = [...mockTurmas];

    if (etapa && etapa !== "todos") {
      filtered = filtered.filter((item) => item.etapa === etapa);
    }

    if (turno && turno !== "todos") {
      filtered = filtered.filter((item) => item.turno === turno);
    }

    if (search) {
      filtered = filtered.filter((item) =>
        item.nome.toLowerCase().includes(search.toString().toLowerCase())
      );
    }

    // Paginação simples
    const start = offset ? parseInt(offset as string) : 0;
    const end = limit ? start + parseInt(limit as string) : undefined;
    const paged = filtered.slice(start, end);

    res.json({
      success: true,
      data: paged,
      total: filtered.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar turmas",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

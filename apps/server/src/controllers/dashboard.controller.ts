import { Request, Response } from "express";

// Dados mock para demonstração
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

const mockPreMatriculas = [
  {
    id: "1",
    protocolo: "PRE-2024-001",
    aluno: "João Silva Santos",
    responsavel: "Maria Silva",
    telefone: "(11) 99999-9999",
    etapa: "maternal",
    status: "pre",
    data: "2024-01-15",
  },
  {
    id: "2",
    protocolo: "PRE-2024-002",
    aluno: "Ana Costa Lima",
    responsavel: "Pedro Costa",
    telefone: "(11) 88888-8888",
    etapa: "pre_escola",
    status: "pre",
    data: "2024-01-14",
  },
  {
    id: "3",
    protocolo: "PRE-2024-003",
    aluno: "Carlos Oliveira",
    responsavel: "Sandra Oliveira",
    telefone: "(11) 77777-7777",
    etapa: "bercario",
    status: "pre",
    data: "2024-01-13",
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
    const { status, turma, search } = req.query;

    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 400));

    let filtered = [...mockMatriculasRecentes];

    if (status && status !== "todos") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.aluno.toLowerCase().includes(search.toString().toLowerCase()) ||
          item.responsavel
            .toLowerCase()
            .includes(search.toString().toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
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
    const { status, etapa, search } = req.query;

    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 400));

    let filtered = [...mockPreMatriculas];

    if (status && status !== "todos") {
      filtered = filtered.filter((item) => item.status === status);
    }

    if (etapa && etapa !== "todos") {
      filtered = filtered.filter((item) => item.etapa === etapa);
    }

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.aluno.toLowerCase().includes(search.toString().toLowerCase()) ||
          item.responsavel
            .toLowerCase()
            .includes(search.toString().toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar pré-matrículas",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

export const getTurmas = async (req: Request, res: Response) => {
  try {
    const { etapa, turno, search } = req.query;

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

    res.json({
      success: true,
      data: filtered,
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

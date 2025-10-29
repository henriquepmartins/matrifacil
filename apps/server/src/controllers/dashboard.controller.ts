import type { Request, Response } from "express";
import { preMatriculaService } from "../services/pre-matricula.service.js";
import { AppError } from "../middlewares/error.middleware.js";
import { db } from "../config/database.config.js";
import { sql } from "drizzle-orm";

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
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID é obrigatório",
      });
    }
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

export const createMatriculaFromPre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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

export const updateMatriculasWithTurmas = async (
  req: Request,
  res: Response
) => {
  try {
    await preMatriculaService.updateMatriculasWithTurmas();

    res.json({
      success: true,
      message: "Matrículas atualizadas com turmas baseadas na etapa dos alunos",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar matrículas com turmas",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

export const getTurmas = async (req: Request, res: Response) => {
  try {
    const { etapa, turno, search, limit, offset, ativa } = req.query;

    console.log("🔍 Buscando turmas do banco de dados...", { etapa, turno, search, ativa });

    // Construir condições de filtro
    const conditions = [];
    
    if (etapa && etapa !== "todos") {
      conditions.push(sql`etapa = ${etapa}`);
    }

    if (turno && turno !== "todos") {
      conditions.push(sql`turno = ${turno}`);
    }

    if (ativa !== undefined) {
      const ativaValue = ativa === "true" || ativa === true || ativa === "1";
      conditions.push(sql`ativa = ${ativaValue}`);
    }

    if (search) {
      conditions.push(sql`LOWER(nome) LIKE ${`%${search.toString().toLowerCase()}%`}`);
    }

    // Construir query base
    let query = sql`
      SELECT id, id_global as "idGlobal", nome, etapa, turno, capacidade, 
             vagas_disponiveis as "vagasDisponiveis", ano_letivo as "anoLetivo", 
             ativa, created_at as "createdAt", updated_at as "updatedAt"
      FROM turma
    `;

    // Adicionar condições WHERE se houver
    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`;
    }

    // Adicionar ordenação
    query = sql`${query} ORDER BY nome`;

    // Executar query
    const result = await db.execute(query);
    let turmas = result.rows as any[];

    console.log(`✅ ${turmas.length} turmas encontradas`);

    // Aplicar paginação se fornecida
    const start = offset ? parseInt(offset as string) : 0;
    const limitNum = limit ? parseInt(limit as string) : turmas.length;
    const paged = turmas.slice(start, start + limitNum);

    res.json({
      success: true,
      data: paged,
      total: turmas.length,
      limit: limitNum,
      offset: start,
    });
  } catch (error) {
    console.error("❌ Erro ao buscar turmas:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar turmas",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

export const updateMatricula = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await preMatriculaService.updateMatricula(id, updateData);

    res.json({
      success: true,
      data: result,
      message: "Matrícula atualizada com sucesso",
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
        message: "Erro ao atualizar matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const deleteMatricula = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID é obrigatório",
      });
    }

    await preMatriculaService.deleteMatricula(id);

    res.json({
      success: true,
      message: "Matrícula deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar matrícula:", error);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erro ao deletar matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const approveMatricula = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { turmaId } = req.body;

    const result = await preMatriculaService.approveMatricula(id, turmaId);

    res.json({
      success: true,
      data: result,
      message: "Matrícula aprovada com sucesso",
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
        message: "Erro ao aprovar matrícula",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const buscarAlunos = async (req: Request, res: Response) => {
  try {
    const { search, limit = 20 } = req.query;

    const result = await preMatriculaService.buscarAlunos({
      search: search as string | undefined,
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      data: result,
      total: result.length,
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
        message: "Erro ao buscar alunos",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
};

export const getTurmaDetalhes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID da turma é obrigatório",
      });
    }

    console.log("🔍 Buscando detalhes da turma:", id);

    // Buscar informações da turma
    const turmaResult = await db.execute(sql`
      SELECT 
        id, 
        id_global as "idGlobal", 
        nome, 
        etapa, 
        turno, 
        capacidade, 
        vagas_disponiveis as "vagasDisponiveis", 
        ano_letivo as "anoLetivo", 
        ativa, 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM turma
      WHERE id = ${id}
    `);

    if (!turmaResult.rows || turmaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Turma não encontrada",
      });
    }

    const turma = turmaResult.rows[0];

    // Buscar alunos matriculados na turma com informações completas
    const alunosResult = await db.execute(sql`
      SELECT 
        m.id as "matriculaId",
        m.protocolo_local as "protocoloLocal",
        m.status as "statusMatricula",
        m.data_matricula as "dataMatricula",
        a.id as "alunoId",
        a.nome as "alunoNome",
        a.data_nascimento as "dataNascimento",
        a.etapa as "etapa",
        a.necessidades_especiais as "necessidadesEspeciais",
        a.observacoes as "observacoesAluno",
        r.id as "responsavelId",
        r.nome as "responsavelNome",
        r.telefone as "responsavelTelefone",
        r.cpf as "responsavelCpf",
        r.endereco as "responsavelEndereco",
        r.bairro as "responsavelBairro",
        r.email as "responsavelEmail",
        r.parentesco as "responsavelParentesco",
        r.autorizado_retirada as "responsavelAutorizadoRetirada"
      FROM matricula m
      INNER JOIN aluno a ON m.aluno_id = a.id
      INNER JOIN responsavel r ON m.responsavel_id = r.id
      WHERE m.turma_id = ${id}
      ORDER BY a.nome
    `);

    const alunos = alunosResult.rows || [];

    // Calcular estatísticas
    const vagasOcupadas = turma.capacidade - turma.vagasDisponiveis;
    const taxaOcupacao = turma.capacidade > 0 
      ? ((vagasOcupadas / turma.capacidade) * 100).toFixed(1)
      : 0;

    const alunosComNecessidadesEspeciais = alunos.filter(
      (a: any) => a.necessidadesEspeciais
    ).length;

    const estatisticas = {
      totalAlunos: alunos.length,
      vagasOcupadas,
      vagasDisponiveis: turma.vagasDisponiveis,
      capacidadeTotal: turma.capacidade,
      taxaOcupacao: parseFloat(taxaOcupacao as string),
      alunosComNecessidadesEspeciais,
      percentualNecessidadesEspeciais: alunos.length > 0
        ? ((alunosComNecessidadesEspeciais / alunos.length) * 100).toFixed(1)
        : 0,
    };

    console.log(`✅ Turma encontrada com ${alunos.length} alunos`);

    res.json({
      success: true,
      data: {
        turma,
        alunos,
        estatisticas,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar detalhes da turma:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar detalhes da turma",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

export const transferirAluno = async (req: Request, res: Response) => {
  try {
    const { matriculaId, turmaOrigemId, turmaDestinoId } = req.body;

    if (!matriculaId || !turmaOrigemId || !turmaDestinoId) {
      return res.status(400).json({
        success: false,
        message: "matriculaId, turmaOrigemId e turmaDestinoId são obrigatórios",
      });
    }

    console.log("🔄 Transferindo aluno:", {
      matriculaId,
      turmaOrigemId,
      turmaDestinoId,
    });

    // Buscar informações das turmas
    const turmasResult = await db.execute(sql`
      SELECT 
        id, 
        nome, 
        etapa, 
        turno, 
        capacidade, 
        vagas_disponiveis as "vagasDisponiveis",
        ativa
      FROM turma
      WHERE id IN (${turmaOrigemId}, ${turmaDestinoId})
    `);

    if (!turmasResult.rows || turmasResult.rows.length !== 2) {
      return res.status(404).json({
        success: false,
        message: "Uma ou ambas as turmas não foram encontradas",
      });
    }

    const turmaOrigem = turmasResult.rows.find((t: any) => t.id === turmaOrigemId);
    const turmaDestino = turmasResult.rows.find((t: any) => t.id === turmaDestinoId);

    if (!turmaOrigem || !turmaDestino) {
      return res.status(404).json({
        success: false,
        message: "Turma de origem ou destino não encontrada",
      });
    }

    // Validação: turmas devem ser da mesma etapa
    if (turmaOrigem.etapa !== turmaDestino.etapa) {
      return res.status(400).json({
        success: false,
        message: `Não é possível transferir aluno entre turmas de etapas diferentes. Origem: ${turmaOrigem.etapa}, Destino: ${turmaDestino.etapa}`,
      });
    }

    // Validação: turma destino deve estar ativa
    if (!turmaDestino.ativa) {
      return res.status(400).json({
        success: false,
        message: "Turma de destino não está ativa",
      });
    }

    // Validação: turma destino deve ter vagas disponíveis
    if (turmaDestino.vagasDisponiveis <= 0) {
      return res.status(400).json({
        success: false,
        message: "Turma de destino não possui vagas disponíveis",
      });
    }

    // Verificar se a matrícula existe e está na turma origem
    const matriculaResult = await db.execute(sql`
      SELECT id, turma_id as "turmaId", aluno_id as "alunoId"
      FROM matricula
      WHERE id = ${matriculaId}
    `);

    if (!matriculaResult.rows || matriculaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Matrícula não encontrada",
      });
    }

    const matricula = matriculaResult.rows[0] as any;

    if (matricula.turmaId !== turmaOrigemId) {
      return res.status(400).json({
        success: false,
        message: "A matrícula não pertence à turma de origem informada",
      });
    }

    // Executar transferência em uma transação
    await db.transaction(async (tx) => {
      // Atualizar matrícula para nova turma
      await tx.execute(sql`
        UPDATE matricula
        SET turma_id = ${turmaDestinoId}, updated_at = NOW()
        WHERE id = ${matriculaId}
      `);

      // Incrementar vaga na turma origem
      await tx.execute(sql`
        UPDATE turma
        SET vagas_disponiveis = vagas_disponiveis + 1, updated_at = NOW()
        WHERE id = ${turmaOrigemId}
      `);

      // Decrementar vaga na turma destino
      await tx.execute(sql`
        UPDATE turma
        SET vagas_disponiveis = vagas_disponiveis - 1, updated_at = NOW()
        WHERE id = ${turmaDestinoId}
      `);
    });

    console.log("✅ Transferência realizada com sucesso");

    res.json({
      success: true,
      message: `Aluno transferido com sucesso de "${turmaOrigem.nome}" para "${turmaDestino.nome}"`,
      data: {
        matriculaId,
        turmaOrigem: {
          id: turmaOrigem.id,
          nome: turmaOrigem.nome,
        },
        turmaDestino: {
          id: turmaDestino.id,
          nome: turmaDestino.nome,
        },
      },
    });
  } catch (error) {
    console.error("❌ Erro ao transferir aluno:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao transferir aluno",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
};

import { db } from "../config/database.config.js";
import {
  matricula,
  aluno,
  responsavel,
  turma,
  documento,
} from "@matrifacil-/db/schema/matriculas.js";
import { eq, and, or, like, desc, asc, isNull, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface CreatePreMatriculaData {
  aluno: {
    nome: string;
    dataNascimento: Date;
    etapa: "bercario" | "maternal" | "pre_escola" | "fundamental";
    necessidadesEspeciais?: boolean;
    observacoes?: string;
  };
  responsavel: {
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    bairro: string;
    email?: string;
    parentesco?: string;
    autorizadoRetirada?: boolean;
  };
  observacoes?: string;
}

export interface UpdatePreMatriculaData {
  aluno?: Partial<CreatePreMatriculaData["aluno"]>;
  responsavel?: Partial<CreatePreMatriculaData["responsavel"]>;
  observacoes?: string;
}

export interface PreMatriculaFilters {
  status?: string;
  etapa?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface MatriculaFilters {
  status?: string; // pre | pendente_doc | completo | concluido
  etapa?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PreMatriculaWithDetails {
  id: string;
  protocoloLocal: string;
  status: "pre" | "pendente_doc" | "completo" | "concluido";
  dataMatricula: Date | null;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
  aluno: {
    id: string;
    nome: string;
    dataNascimento: Date;
    etapa: string;
    necessidadesEspeciais: boolean;
    observacoes: string | null;
  };
  responsavel: {
    id: string;
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    bairro: string;
    email: string | null;
    parentesco: string;
    autorizadoRetirada: boolean;
  };
  turma?: {
    id: string;
    nome: string;
    etapa: string;
    turno: string;
  } | null;
}

export class PreMatriculaRepository {
  async findBestTurmaForEtapa(
    etapa: string
  ): Promise<{ id: string; nome: string } | null> {
    const mockTurmas = [
      {
        id: "turma-1",
        nome: "Berçário A",
        etapa: "bercario",
        turno: "integral",
        capacidade: 15,
        vagasDisponiveis: 3,
      },
      {
        id: "turma-2",
        nome: "Maternal A",
        etapa: "maternal",
        turno: "manha",
        capacidade: 20,
        vagasDisponiveis: 5,
      },
      {
        id: "turma-3",
        nome: "Maternal B",
        etapa: "maternal",
        turno: "tarde",
        capacidade: 20,
        vagasDisponiveis: 0,
      },
      {
        id: "turma-4",
        nome: "Pré-Escola A",
        etapa: "pre_escola",
        turno: "manha",
        capacidade: 25,
        vagasDisponiveis: 8,
      },
      {
        id: "turma-5",
        nome: "Pré-Escola B",
        etapa: "pre_escola",
        turno: "tarde",
        capacidade: 25,
        vagasDisponiveis: 5,
      },
      {
        id: "turma-6",
        nome: "Fundamental A",
        etapa: "fundamental",
        turno: "manha",
        capacidade: 30,
        vagasDisponiveis: 10,
      },
    ];

    const turmasDisponiveis = mockTurmas.filter(
      (t) => t.etapa === etapa && t.vagasDisponiveis > 0
    );

    if (turmasDisponiveis.length === 0) {
      return null;
    }

    const turma = turmasDisponiveis[0];
    return { id: turma.id, nome: turma.nome };
  }

  async updateMatriculasWithTurmas(): Promise<void> {}

  async updateMatricula(
    id: string,
    data: any
  ): Promise<PreMatriculaWithDetails | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    if (
      data.alunoNome ||
      data.alunoDataNascimento ||
      data.alunoEtapa ||
      data.alunoNecessidadesEspeciais !== undefined ||
      data.alunoObservacoes !== undefined
    ) {
      await db
        .update(aluno)
        .set({
          nome: data.alunoNome || existing.aluno.nome,
          dataNascimento: data.alunoDataNascimento
            ? new Date(data.alunoDataNascimento)
            : existing.aluno.dataNascimento,
          etapa: data.alunoEtapa || existing.aluno.etapa,
          necessidadesEspeciais:
            data.alunoNecessidadesEspeciais !== undefined
              ? data.alunoNecessidadesEspeciais
              : existing.aluno.necessidadesEspeciais,
          observacoes:
            data.alunoObservacoes !== undefined
              ? data.alunoObservacoes
              : existing.aluno.observacoes,
          // Remover updatedAt - ele tem defaultNow()
        })
        .where(eq(aluno.id, existing.aluno.id));
    }

    if (
      data.responsavelNome ||
      data.responsavelCpf ||
      data.responsavelTelefone ||
      data.responsavelEmail !== undefined ||
      data.responsavelEndereco ||
      data.responsavelBairro ||
      data.responsavelParentesco ||
      data.responsavelAutorizadoRetirada !== undefined
    ) {
      await db
        .update(responsavel)
        .set({
          nome: data.responsavelNome || existing.responsavel.nome,
          cpf: data.responsavelCpf || existing.responsavel.cpf,
          telefone: data.responsavelTelefone || existing.responsavel.telefone,
          email:
            data.responsavelEmail !== undefined
              ? data.responsavelEmail
              : existing.responsavel.email,
          endereco: data.responsavelEndereco || existing.responsavel.endereco,
          bairro: data.responsavelBairro || existing.responsavel.bairro,
          parentesco:
            data.responsavelParentesco || existing.responsavel.parentesco,
          autorizadoRetirada:
            data.responsavelAutorizadoRetirada !== undefined
              ? data.responsavelAutorizadoRetirada
              : existing.responsavel.autorizadoRetirada,
          // Remover updatedAt - ele tem defaultNow()
        })
        .where(eq(responsavel.id, existing.responsavel.id));
    }

    if (data.observacoes !== undefined) {
      await db
        .update(matricula)
        .set({
          observacoes: data.observacoes,
          // Remover updatedAt - ele tem defaultNow()
        })
        .where(eq(matricula.id, id));
    }

    return this.findById(id) as Promise<PreMatriculaWithDetails>;
  }

  async approveMatricula(id: string, turmaId?: string): Promise<PreMatriculaWithDetails | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    if (existing.status === "completo") {
      throw new Error("Matrícula já está aprovada");
    }

    // Atualiza a matrícula com o status completo e a turma (se fornecida)
    await db
      .update(matricula)
      .set({
        status: "completo",
        dataMatricula: new Date(),
        ...(turmaId ? { turmaId } : {}),
        // Remover updatedAt - ele tem defaultNow()
      })
      .where(eq(matricula.id, id));

    // Atualiza o status do aluno
    await db
      .update(aluno)
      .set({
        status: "completo",
        // Remover updatedAt - ele tem defaultNow()
      })
      .where(eq(aluno.id, existing.aluno.id));

    return this.findById(id) as Promise<PreMatriculaWithDetails>;
  }

  async deleteMatricula(id: string): Promise<boolean> {
    const existing = await this.findByIdAny(id);
    if (!existing) {
      return false;
    }

    try {
      // Deletar documentos relacionados primeiro
      await db.delete(documento).where(eq(documento.matriculaId, id));

      // Deletar a matrícula
      await db.delete(matricula).where(eq(matricula.id, id));

      return true;
    } catch (error) {
      console.error("Erro ao deletar matrícula:", error);
      return false;
    }
  }

  async findResponsavelByCPF(cpfValue: string): Promise<{ id: string } | null> {
    const [result] = await db
      .select({ id: responsavel.id })
      .from(responsavel)
      .where(eq(responsavel.cpf, cpfValue))
      .limit(1);
    return result || null;
  }
  private async generateProtocolo(): Promise<string> {
    const year = new Date().getFullYear();

    const existingProtocols = await db
      .select({ protocoloLocal: matricula.protocoloLocal })
      .from(matricula)
      .where(like(matricula.protocoloLocal, `PRE-${year}-%`))
      .orderBy(desc(matricula.protocoloLocal));

    let nextNumber = 1;
    if (existingProtocols.length > 0) {
      const lastProtocol = existingProtocols[0].protocoloLocal;
      const match = lastProtocol.match(/PRE-\d{4}-(\d{3})/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `PRE-${year}-${nextNumber.toString().padStart(3, "0")}`;
  }

  async createPreMatricula(
    data: CreatePreMatriculaData
  ): Promise<PreMatriculaWithDetails> {
    const protocolo = await this.generateProtocolo();

    const alunoId = uuidv4();
    const [newAluno] = await db
      .insert(aluno)
      .values({
        id: alunoId,
        idGlobal: uuidv4(),
        nome: data.aluno.nome,
        dataNascimento: data.aluno.dataNascimento,
        etapa: data.aluno.etapa,
        status: "pre",
        necessidadesEspeciais: data.aluno.necessidadesEspeciais || false,
        observacoes: data.aluno.observacoes,
        // Remover createdAt e updatedAt - eles têm defaultNow()
      })
      .returning();

    const responsavelId = uuidv4();
    const idGlobal = uuidv4();

    // Usar SQL raw para inserir apenas os campos necessários
    console.log("🔍 Tentando inserir responsável:", {
      id: responsavelId,
      nome: data.responsavel.nome,
      cpf: data.responsavel.cpf,
    });

    let newResponsavel;
    try {
      const result = await db.execute(sql`
        INSERT INTO responsavel (
          id, id_global, nome, cpf, telefone, endereco, bairro, email
        ) VALUES (
          ${responsavelId}, ${idGlobal}, ${data.responsavel.nome}, ${data.responsavel.cpf}, 
          ${data.responsavel.telefone}, ${data.responsavel.endereco}, ${data.responsavel.bairro}, 
          ${data.responsavel.email}
        ) RETURNING id, nome, cpf
      `);

      console.log("✅ Responsável inserido com sucesso:", result.rows[0]);
      newResponsavel = result.rows[0];
    } catch (error) {
      console.error("❌ Erro detalhado ao inserir responsável:", {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        constraint: error.constraint,
        fullError: error,
      });
      throw error;
    }

    const matriculaId = uuidv4();
    const [newMatricula] = await db
      .insert(matricula)
      .values({
        id: matriculaId,
        idGlobal: uuidv4(),
        protocoloLocal: protocolo,
        alunoId: alunoId,
        responsavelId: responsavelId,
        status: "pre",
        observacoes: data.observacoes,
        // Remover createdAt e updatedAt - eles têm defaultNow()
      })
      .returning();

    return this.findById(matriculaId) as Promise<PreMatriculaWithDetails>;
  }

  async findAll(
    filters: PreMatriculaFilters = {}
  ): Promise<PreMatriculaWithDetails[]> {
    let query = db
      .select({
        id: matricula.id,
        protocoloLocal: matricula.protocoloLocal,
        status: matricula.status,
        dataMatricula: matricula.dataMatricula,
        observacoes: matricula.observacoes,
        createdAt: matricula.createdAt,
        updatedAt: matricula.updatedAt,
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          dataNascimento: aluno.dataNascimento,
          etapa: aluno.etapa,
          necessidadesEspeciais: aluno.necessidadesEspeciais,
          observacoes: aluno.observacoes,
        },
        responsavel: {
          id: responsavel.id,
          nome: responsavel.nome,
          cpf: responsavel.cpf,
          telefone: responsavel.telefone,
          endereco: responsavel.endereco,
          bairro: responsavel.bairro,
          email: responsavel.email,
          parentesco: responsavel.parentesco,
          autorizadoRetirada: responsavel.autorizadoRetirada,
        },
        turma: {
          id: turma.id,
          nome: turma.nome,
          etapa: turma.etapa,
          turno: turma.turno,
        },
      })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id))
      .where(eq(matricula.status, "pre"))
      .orderBy(desc(matricula.createdAt));

    if (filters.etapa) {
      query = query.where(
        and(eq(matricula.status, "pre"), eq(aluno.etapa, filters.etapa as any))
      );
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        and(
          eq(matricula.status, "pre"),
          or(
            like(aluno.nome, searchTerm),
            like(responsavel.nome, searchTerm),
            like(matricula.protocoloLocal, searchTerm)
          )
        )
      );
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return query;
  }

  async findAllMatriculas(
    filters: MatriculaFilters = {}
  ): Promise<PreMatriculaWithDetails[]> {
    let query = db
      .select({
        id: matricula.id,
        protocoloLocal: matricula.protocoloLocal,
        status: matricula.status,
        dataMatricula: matricula.dataMatricula,
        observacoes: matricula.observacoes,
        createdAt: matricula.createdAt,
        updatedAt: matricula.updatedAt,
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          dataNascimento: aluno.dataNascimento,
          etapa: aluno.etapa,
          necessidadesEspeciais: aluno.necessidadesEspeciais,
          observacoes: aluno.observacoes,
        },
        responsavel: {
          id: responsavel.id,
          nome: responsavel.nome,
          cpf: responsavel.cpf,
          telefone: responsavel.telefone,
          endereco: responsavel.endereco,
          bairro: responsavel.bairro,
          email: responsavel.email,
          parentesco: responsavel.parentesco,
          autorizadoRetirada: responsavel.autorizadoRetirada,
        },
        turma: {
          id: turma.id,
          nome: turma.nome,
          etapa: turma.etapa,
          turno: turma.turno,
        },
      })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id))
      .orderBy(desc(matricula.createdAt));

    if (filters.status && filters.status !== "todos") {
      query = query.where(eq(matricula.status, filters.status as any));
    }

    if (filters.etapa) {
      query = query.where(eq(aluno.etapa, filters.etapa as any));
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        or(
          like(aluno.nome, searchTerm),
          like(responsavel.nome, searchTerm),
          like(matricula.protocoloLocal, searchTerm)
        )
      );
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;

    const resultsWithTurmas = await Promise.all(
      results.map(async (matricula) => {
        if (!matricula.turma) {
          const bestTurma = await this.findBestTurmaForEtapa(
            matricula.aluno.etapa
          );
          if (bestTurma) {
            return {
              ...matricula,
              turma: {
                id: bestTurma.id,
                nome: bestTurma.nome,
                etapa: matricula.aluno.etapa,
                turno: "manha",
              },
            };
          }
        }
        return matricula;
      })
    );

    return resultsWithTurmas;
  }

  async findById(id: string): Promise<PreMatriculaWithDetails | null> {
    const [result] = await db
      .select({
        id: matricula.id,
        protocoloLocal: matricula.protocoloLocal,
        status: matricula.status,
        dataMatricula: matricula.dataMatricula,
        observacoes: matricula.observacoes,
        createdAt: matricula.createdAt,
        updatedAt: matricula.updatedAt,
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          dataNascimento: aluno.dataNascimento,
          etapa: aluno.etapa,
          necessidadesEspeciais: aluno.necessidadesEspeciais,
          observacoes: aluno.observacoes,
        },
        responsavel: {
          id: responsavel.id,
          nome: responsavel.nome,
          cpf: responsavel.cpf,
          telefone: responsavel.telefone,
          endereco: responsavel.endereco,
          bairro: responsavel.bairro,
          email: responsavel.email,
          parentesco: responsavel.parentesco,
          autorizadoRetirada: responsavel.autorizadoRetirada,
        },
        turma: {
          id: turma.id,
          nome: turma.nome,
          etapa: turma.etapa,
          turno: turma.turno,
        },
      })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id))
      .where(and(eq(matricula.id, id), eq(matricula.status, "pre")))
      .limit(1);

    return result || null;
  }

  async findByIdAny(id: string): Promise<PreMatriculaWithDetails | null> {
    const [result] = await db
      .select({
        id: matricula.id,
        protocoloLocal: matricula.protocoloLocal,
        status: matricula.status,
        dataMatricula: matricula.dataMatricula,
        observacoes: matricula.observacoes,
        createdAt: matricula.createdAt,
        updatedAt: matricula.updatedAt,
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          dataNascimento: aluno.dataNascimento,
          etapa: aluno.etapa,
          necessidadesEspeciais: aluno.necessidadesEspeciais,
          observacoes: aluno.observacoes,
        },
        responsavel: {
          id: responsavel.id,
          nome: responsavel.nome,
          cpf: responsavel.cpf,
          telefone: responsavel.telefone,
          endereco: responsavel.endereco,
          bairro: responsavel.bairro,
          email: responsavel.email,
          parentesco: responsavel.parentesco,
          autorizadoRetirada: responsavel.autorizadoRetirada,
        },
        turma: {
          id: turma.id,
          nome: turma.nome,
          etapa: turma.etapa,
          turno: turma.turno,
        },
      })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id))
      .where(eq(matricula.id, id))
      .limit(1);

    return result || null;
  }

  async updatePreMatricula(
    id: string,
    data: UpdatePreMatriculaData
  ): Promise<PreMatriculaWithDetails | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    if (data.aluno) {
      await db
        .update(aluno)
        .set({
          ...data.aluno,
          // Remover updatedAt - ele tem defaultNow()
        })
        .where(eq(aluno.id, existing.aluno.id));
    }

    if (data.responsavel) {
      await db
        .update(responsavel)
        .set({
          ...data.responsavel,
          // Remover updatedAt - ele tem defaultNow()
        })
        .where(eq(responsavel.id, existing.responsavel.id));
    }

    await db
      .update(matricula)
      .set({
        observacoes: data.observacoes,
        // Remover updatedAt - ele tem defaultNow()
      })
      .where(eq(matricula.id, id));

    return this.findById(id) as Promise<PreMatriculaWithDetails>;
  }

  async deletePreMatricula(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    await db.delete(matricula).where(eq(matricula.id, id));
    return true;
  }

  async convertToMatriculaCompleta(
    id: string,
    turmaId?: string,
    dataMatriculaOverride?: Date,
    documentosIniciais?: { tipo: string; observacoes?: string }[]
  ): Promise<PreMatriculaWithDetails | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    let finalTurmaId = turmaId;
    if (!finalTurmaId) {
      const bestTurma = await this.findBestTurmaForEtapa(existing.aluno.etapa);
      finalTurmaId = bestTurma?.id || null;
    }

    await db
      .update(matricula)
      .set({
        status: "completo",
        dataMatricula: dataMatriculaOverride || new Date(),
        turmaId: finalTurmaId,
        // Remover updatedAt - ele tem defaultNow()
      })
      .where(eq(matricula.id, id));

    await db
      .update(aluno)
      .set({
        status: "completo",
        // Remover updatedAt - ele tem defaultNow()
      })
      .where(eq(aluno.id, existing.aluno.id));

    if (documentosIniciais && documentosIniciais.length > 0) {
      await db.insert(documento).values(
        documentosIniciais.map((d) => ({
          id: uuidv4(),
          matriculaId: id,
          tipo: d.tipo as any,
          status: "pendente",
          observacoes: d.observacoes,
          createdAt: new Date(),
          // Remover updatedAt - ele tem defaultNow()
        }))
      );
    }

    return this.findByIdAny(id) as Promise<PreMatriculaWithDetails>;
  }

  async count(filters: PreMatriculaFilters = {}): Promise<number> {
    let query = db
      .select({ count: matricula.id })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .where(eq(matricula.status, "pre"));

    if (filters.etapa) {
      query = query.where(
        and(eq(matricula.status, "pre"), eq(aluno.etapa, filters.etapa as any))
      );
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        and(
          eq(matricula.status, "pre"),
          or(
            like(aluno.nome, searchTerm),
            like(responsavel.nome, searchTerm),
            like(matricula.protocoloLocal, searchTerm)
          )
        )
      );
    }

    const result = await query;
    return result.length;
  }
}

export const preMatriculaRepository = new PreMatriculaRepository();

import { db } from "../config/database.js";
import {
  matricula,
  aluno,
  responsavel,
  turma,
} from "@matrifacil-/db/schema/matriculas";
import { eq, and, or, like, desc, asc } from "drizzle-orm";
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
  /**
   * Gera um protocolo único para pré-matrícula
   */
  private async generateProtocolo(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await db
      .select({ count: matricula.id })
      .from(matricula)
      .where(like(matricula.protocoloLocal, `PRE-${year}-%`));

    const nextNumber = (count.length || 0) + 1;
    return `PRE-${year}-${nextNumber.toString().padStart(3, "0")}`;
  }

  /**
   * Cria uma nova pré-matrícula
   */
  async createPreMatricula(
    data: CreatePreMatriculaData
  ): Promise<PreMatriculaWithDetails> {
    const protocolo = await this.generateProtocolo();

    // Criar aluno
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
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Criar responsável
    const responsavelId = uuidv4();
    const [newResponsavel] = await db
      .insert(responsavel)
      .values({
        id: responsavelId,
        idGlobal: uuidv4(),
        nome: data.responsavel.nome,
        cpf: data.responsavel.cpf,
        telefone: data.responsavel.telefone,
        endereco: data.responsavel.endereco,
        bairro: data.responsavel.bairro,
        email: data.responsavel.email,
        parentesco: data.responsavel.parentesco || "pai",
        autorizadoRetirada: data.responsavel.autorizadoRetirada ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Criar matrícula (pré-matrícula)
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
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return this.findById(matriculaId) as Promise<PreMatriculaWithDetails>;
  }

  /**
   * Busca pré-matrículas com filtros
   */
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

    // Aplicar filtros
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

  /**
   * Busca uma pré-matrícula por ID
   */
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

  /**
   * Atualiza uma pré-matrícula
   */
  async updatePreMatricula(
    id: string,
    data: UpdatePreMatriculaData
  ): Promise<PreMatriculaWithDetails | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    // Atualizar aluno se fornecido
    if (data.aluno) {
      await db
        .update(aluno)
        .set({
          ...data.aluno,
          updatedAt: new Date(),
        })
        .where(eq(aluno.id, existing.aluno.id));
    }

    // Atualizar responsável se fornecido
    if (data.responsavel) {
      await db
        .update(responsavel)
        .set({
          ...data.responsavel,
          updatedAt: new Date(),
        })
        .where(eq(responsavel.id, existing.responsavel.id));
    }

    // Atualizar matrícula
    await db
      .update(matricula)
      .set({
        observacoes: data.observacoes,
        updatedAt: new Date(),
      })
      .where(eq(matricula.id, id));

    return this.findById(id) as Promise<PreMatriculaWithDetails>;
  }

  /**
   * Deleta uma pré-matrícula
   */
  async deletePreMatricula(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    // Deletar matrícula (cascade deletará aluno e responsável)
    await db.delete(matricula).where(eq(matricula.id, id));
    return true;
  }

  /**
   * Converte pré-matrícula para matrícula completa
   */
  async convertToMatriculaCompleta(
    id: string,
    turmaId?: string
  ): Promise<PreMatriculaWithDetails | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    // Atualizar status da matrícula
    await db
      .update(matricula)
      .set({
        status: "completo",
        dataMatricula: new Date(),
        turmaId: turmaId || null,
        updatedAt: new Date(),
      })
      .where(eq(matricula.id, id));

    // Atualizar status do aluno
    await db
      .update(aluno)
      .set({
        status: "completo",
        updatedAt: new Date(),
      })
      .where(eq(aluno.id, existing.aluno.id));

    return this.findById(id) as Promise<PreMatriculaWithDetails>;
  }

  /**
   * Conta total de pré-matrículas
   */
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

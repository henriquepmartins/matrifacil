import { Matricula } from "../../domain/entities/matricula.entity";
import { Aluno } from "../../domain/entities/aluno.entity";
import { Responsavel } from "../../domain/entities/responsavel.entity";
import { Turma } from "../../domain/entities/matricula.entity";
import type { MatriculaRepository } from "../../domain/repositories";
import { db } from "../database/database.config";
import {
  matricula,
  aluno,
  responsavel,
  turma,
} from "@matrifacil-/db/schema/matriculas";
import { eq, and, sql, like, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class DrizzleMatriculaRepository implements MatriculaRepository {
  async findById(id: string): Promise<Matricula | null> {
    const [result] = await db
      .select({
        matricula: matricula,
        aluno: aluno,
        responsavel: responsavel,
        turma: turma,
      })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id))
      .where(eq(matricula.id, id))
      .limit(1);

    if (!result || !result.aluno || !result.responsavel) return null;

    return Matricula.create({
      id: result.matricula.id,
      idGlobal: result.matricula.idGlobal,
      protocoloLocal: result.matricula.protocoloLocal,
      aluno: Aluno.create({
        id: result.aluno.id,
        idGlobal: result.aluno.idGlobal,
        nome: result.aluno.nome,
        dataNascimento: result.aluno.dataNascimento,
        etapa: result.aluno.etapa as any,
        status: result.matricula.status as any,
        necessidadesEspeciais: result.aluno.necessidadesEspeciais,
        observacoes: result.aluno.observacoes,
      }),
      responsavel: Responsavel.create({
        id: result.responsavel.id,
        idGlobal: result.responsavel.idGlobal,
        nome: result.responsavel.nome,
        cpf: result.responsavel.cpf,
        telefone: result.responsavel.telefone,
        endereco: result.responsavel.endereco,
        bairro: result.responsavel.bairro,
        email: result.responsavel.email,
        parentesco: result.responsavel.parentesco,
        autorizadoRetirada: result.responsavel.autorizadoRetirada,
      }),
      turma: result.turma
        ? Turma.create({
            id: result.turma.id,
            idGlobal: result.turma.id,
            etapa: result.turma.etapa,
            turno: result.turma.turno as any,
            capacidade: 20,
            vagasDisponiveis: 5,
            anoLetivo: "2024",
            nome: result.turma.nome,
            ativa: true,
          })
        : undefined,
      status: result.matricula.status as any,
      dataMatricula: result.matricula.dataMatricula,
      observacoes: result.matricula.observacoes,
    });
  }

  async findByProtocolo(protocolo: string): Promise<Matricula | null> {
    return null;
  }

  async findByStatus(status: string): Promise<Matricula[]> {
    const results = await db
      .select({
        matricula: matricula,
        aluno: aluno,
        responsavel: responsavel,
        turma: turma,
      })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id))
      .where(eq(matricula.status, status as any));

    return results.map(this.mapToMatricula);
  }

  async findByEtapa(etapa: string): Promise<Matricula[]> {
    const results = await db
      .select({
        matricula: matricula,
        aluno: aluno,
        responsavel: responsavel,
        turma: turma,
      })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id))
      .where(eq(aluno.etapa, etapa as any));

    return results.map(this.mapToMatricula);
  }

  async findBySearch(search: string): Promise<Matricula[]> {
    const results = await db
      .select({
        matricula: matricula,
        aluno: aluno,
        responsavel: responsavel,
        turma: turma,
      })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id))
      .where(
        or(
          like(aluno.nome, `%${search}%`),
          like(responsavel.nome, `%${search}%`),
          like(matricula.protocoloLocal, `%${search}%`)
        )
      );

    return results.map(this.mapToMatricula);
  }

  async findAll(filters?: any): Promise<Matricula[]> {
    let query = db
      .select({
        matricula: matricula,
        aluno: aluno,
        responsavel: responsavel,
        turma: turma,
      })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id));

    // Buscar todas as matrículas por padrão (tanto "pre" quanto "completo")
    if (filters?.status && filters.status !== "todos") {
      query = query.where(eq(matricula.status, filters.status as any));
    }

    if (filters?.etapa && filters.etapa !== "todos") {
      query = query.where(eq(aluno.etapa, filters.etapa as any));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        or(
          like(aluno.nome, searchTerm),
          like(responsavel.nome, searchTerm),
          like(matricula.protocoloLocal, searchTerm)
        )
      );
    }

    // Adicionar ordenação por data de criação (mais recentes primeiro)
    query = query.orderBy(sql`${matricula.createdAt} DESC`);

    // Adicionar paginação se especificada
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;
    return results.map(this.mapToMatricula);
  }

  async count(filters?: any): Promise<number> {
    let query = db
      .select({ count: sql<number>`count(*)` })
      .from(matricula)
      .leftJoin(aluno, eq(matricula.alunoId, aluno.id))
      .leftJoin(responsavel, eq(matricula.responsavelId, responsavel.id));

    // Buscar todas as matrículas por padrão (tanto "pre" quanto "completo")
    if (filters?.status && filters.status !== "todos") {
      query = query.where(eq(matricula.status, filters.status as any));
    }

    if (filters?.etapa && filters.etapa !== "todos") {
      query = query.where(eq(aluno.etapa, filters.etapa as any));
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.where(
        or(
          like(aluno.nome, searchTerm),
          like(responsavel.nome, searchTerm),
          like(matricula.protocoloLocal, searchTerm)
        )
      );
    }

    const [result] = await query;
    return result?.count || 0;
  }

  async save(matriculaEntity: Matricula): Promise<Matricula> {
    const [result] = await db
      .insert(matricula)
      .values({
        id: matriculaEntity.id,
        idGlobal: matriculaEntity.idGlobal,
        protocoloLocal: matriculaEntity.protocoloLocal,
        alunoId: matriculaEntity.aluno.id,
        responsavelId: matriculaEntity.responsavel.id,
        turmaId: matriculaEntity.turma?.id || null,
        status: matriculaEntity.status,
        dataMatricula: matriculaEntity.dataMatricula,
        observacoes: matriculaEntity.observacoes,
        createdAt: matriculaEntity.createdAt,
        updatedAt: matriculaEntity.updatedAt,
      })
      .returning();

    return Matricula.create({
      id: result.id,
      idGlobal: result.idGlobal,
      protocoloLocal: result.protocoloLocal,
      aluno: matriculaEntity.aluno,
      responsavel: matriculaEntity.responsavel,
      turma: matriculaEntity.turma,
      status: result.status as any,
      dataMatricula: result.dataMatricula,
      observacoes: result.observacoes,
    });
  }

  async update(matriculaEntity: Matricula): Promise<Matricula> {
    // Atualizar a tabela matricula
    await db
      .update(matricula)
      .set({
        status: matriculaEntity.status,
        dataMatricula: matriculaEntity.dataMatricula,
        observacoes: matriculaEntity.observacoes,
        turmaId: matriculaEntity.turma?.id || null,
        // Remover updatedAt - ele tem defaultNow()
      })
      .where(eq(matricula.id, matriculaEntity.id));

    // Atualizar a tabela aluno
    await db
      .update(aluno)
      .set({
        status: matriculaEntity.aluno.status,
        necessidadesEspeciais: matriculaEntity.aluno.necessidadesEspeciais,
        observacoes: matriculaEntity.aluno.observacoes,
        // Remover updatedAt - ele tem defaultNow()
      })
      .where(eq(aluno.id, matriculaEntity.aluno.id));

    // Retornar a matrícula atualizada
    return this.findById(matriculaEntity.id) as Promise<Matricula>;
  }

  async delete(id: string): Promise<void> {
    await db.delete(matricula).where(eq(matricula.id, id));
  }

  async createPreMatricula(data: any): Promise<Matricula> {
    const protocolo = await this.generateProtocolo();

    // Buscar uma turma disponível para a etapa do aluno
    const turmaDisponivel = await db
      .select()
      .from(turma)
      .where(
        and(
          eq(turma.etapa, data.aluno.etapa),
          eq(turma.ativa, true),
          sql`${turma.vagasDisponiveis} > 0`
        )
      )
      .limit(1);

    const turmaId = turmaDisponivel.length > 0 ? turmaDisponivel[0].id : null;

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
        // Remover createdAt e updatedAt - eles têm defaultNow()
      })
      .returning();

    const matriculaId = uuidv4();
    const [newMatricula] = await db
      .insert(matricula)
      .values({
        id: matriculaId,
        idGlobal: uuidv4(),
        protocoloLocal: protocolo,
        alunoId: alunoId,
        responsavelId: responsavelId,
        turmaId: turmaId, // Associar turma se disponível
        status: "pre",
        observacoes: data.observacoes,
        // Remover createdAt e updatedAt - eles têm defaultNow()
      })
      .returning();

    return this.findById(matriculaId) as Promise<Matricula>;
  }

  private async generateProtocolo(): Promise<string> {
    const year = new Date().getFullYear();

    const existingProtocols = await db
      .select({ protocoloLocal: matricula.protocoloLocal })
      .from(matricula)
      .where(like(matricula.protocoloLocal, `PRE-${year}-%`))
      .orderBy(sql`${matricula.protocoloLocal} DESC`);

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

  private mapToMatricula(result: any): Matricula {
    if (!result.aluno || !result.responsavel) {
      throw new Error("Dados incompletos para criar matrícula");
    }

    return Matricula.create({
      id: result.matricula.id,
      idGlobal: result.matricula.idGlobal,
      protocoloLocal: result.matricula.protocoloLocal,
      aluno: Aluno.create({
        id: result.aluno.id,
        idGlobal: result.aluno.idGlobal,
        nome: result.aluno.nome,
        dataNascimento: result.aluno.dataNascimento,
        etapa: result.aluno.etapa as any,
        status: result.matricula.status as any,
        necessidadesEspeciais: result.aluno.necessidadesEspeciais,
        observacoes: result.aluno.observacoes,
      }),
      responsavel: Responsavel.create({
        id: result.responsavel.id,
        idGlobal: result.responsavel.idGlobal,
        nome: result.responsavel.nome,
        cpf: result.responsavel.cpf,
        telefone: result.responsavel.telefone,
        endereco: result.responsavel.endereco,
        bairro: result.responsavel.bairro,
        email: result.responsavel.email,
        parentesco: result.responsavel.parentesco,
        autorizadoRetirada: result.responsavel.autorizadoRetirada,
      }),
      turma: result.turma
        ? Turma.create({
            id: result.turma.id,
            idGlobal: result.turma.id,
            etapa: result.turma.etapa,
            turno: result.turma.turno as any,
            capacidade: 20,
            vagasDisponiveis: 5,
            anoLetivo: "2024",
            nome: result.turma.nome,
            ativa: true,
          })
        : undefined,
      status: result.matricula.status as any,
      dataMatricula: result.matricula.dataMatricula,
      observacoes: result.matricula.observacoes,
      createdAt: result.matricula.createdAt,
      updatedAt: result.matricula.updatedAt,
    });
  }
}

import { db } from "../database/database.config";
import { Aluno } from "../../domain/entities/aluno.entity";
import { AlunoRepository } from "../../domain/repositories";
import { aluno, matricula } from "@matrifacil-/db/schema/matriculas";
import { eq } from "drizzle-orm";

export class DrizzleAlunoRepository implements AlunoRepository {
  async findById(id: string): Promise<Aluno | null> {
    const [result] = await db
      .select()
      .from(aluno)
      .where(eq(aluno.id, id))
      .limit(1);

    if (!result) return null;

    return Aluno.create({
      id: result.id,
      idGlobal: result.idGlobal,
      nome: result.nome,
      dataNascimento: result.dataNascimento,
      etapa: result.etapa as any,
      status: result.status as any,
      necessidadesEspeciais: result.necessidadesEspeciais,
      observacoes: result.observacoes,
      rg: result.rg,
      cpf: result.cpf,
      naturalidade: result.naturalidade,
      nacionalidade: result.nacionalidade,
      sexo: result.sexo,
      corRaca: result.corRaca,
      tipoSanguineo: result.tipoSanguineo,
      alergias: result.alergias,
      medicamentos: result.medicamentos,
      doencas: result.doencas,
      carteiraVacina: result.carteiraVacina,
      observacoesSaude: result.observacoesSaude,
    });
  }

  async findByMatriculaId(matriculaId: string): Promise<Aluno | null> {
    const [result] = await db
      .select()
      .from(aluno)
      .innerJoin(matricula, eq(aluno.id, matricula.alunoId))
      .where(eq(matricula.id, matriculaId))
      .limit(1);

    if (!result) return null;

    return Aluno.create({
      id: result.aluno.id,
      idGlobal: result.aluno.idGlobal,
      nome: result.aluno.nome,
      dataNascimento: result.aluno.dataNascimento,
      etapa: result.aluno.etapa as any,
      status: result.aluno.status as any,
      necessidadesEspeciais: result.aluno.necessidadesEspeciais,
      observacoes: result.aluno.observacoes,
      rg: result.aluno.rg,
      cpf: result.aluno.cpf,
      naturalidade: result.aluno.naturalidade,
      nacionalidade: result.aluno.nacionalidade,
      sexo: result.aluno.sexo,
      corRaca: result.aluno.corRaca,
      tipoSanguineo: result.aluno.tipoSanguineo,
      alergias: result.aluno.alergias,
      medicamentos: result.aluno.medicamentos,
      doencas: result.aluno.doencas,
      carteiraVacina: result.aluno.carteiraVacina,
      observacoesSaude: result.aluno.observacoesSaude,
    });
  }

  async save(alunoEntity: Aluno): Promise<Aluno> {
    const [result] = await db
      .insert(aluno)
      .values({
        id: alunoEntity.id,
        idGlobal: alunoEntity.idGlobal,
        nome: alunoEntity.nome,
        dataNascimento: alunoEntity.dataNascimento,
        etapa: alunoEntity.etapa,
        status: alunoEntity.status,
        necessidadesEspeciais: alunoEntity.necessidadesEspeciais,
        observacoes: alunoEntity.observacoes,
        rg: alunoEntity.rg,
        cpf: alunoEntity.cpf,
        naturalidade: alunoEntity.naturalidade,
        nacionalidade: alunoEntity.nacionalidade,
        sexo: alunoEntity.sexo,
        corRaca: alunoEntity.corRaca,
        tipoSanguineo: alunoEntity.tipoSanguineo,
        alergias: alunoEntity.alergias,
        medicamentos: alunoEntity.medicamentos,
        doencas: alunoEntity.doencas,
        carteiraVacina: alunoEntity.carteiraVacina,
        observacoesSaude: alunoEntity.observacoesSaude,
        createdAt: alunoEntity.createdAt,
        updatedAt: alunoEntity.updatedAt,
      })
      .returning();

    return Aluno.create({
      id: result.id,
      idGlobal: result.idGlobal,
      nome: result.nome,
      dataNascimento: result.dataNascimento,
      etapa: result.etapa as any,
      status: result.status as any,
      necessidadesEspeciais: result.necessidadesEspeciais,
      observacoes: result.observacoes,
      rg: result.rg,
      cpf: result.cpf,
      naturalidade: result.naturalidade,
      nacionalidade: result.nacionalidade,
      sexo: result.sexo,
      corRaca: result.corRaca,
      tipoSanguineo: result.tipoSanguineo,
      alergias: result.alergias,
      medicamentos: result.medicamentos,
      doencas: result.doencas,
      carteiraVacina: result.carteiraVacina,
      observacoesSaude: result.observacoesSaude,
    });
  }

  async update(alunoEntity: Aluno): Promise<Aluno> {
    const [result] = await db
      .update(aluno)
      .set({
        nome: alunoEntity.nome,
        dataNascimento: alunoEntity.dataNascimento,
        etapa: alunoEntity.etapa,
        status: alunoEntity.status,
        necessidadesEspeciais: alunoEntity.necessidadesEspeciais,
        observacoes: alunoEntity.observacoes,
        rg: alunoEntity.rg,
        cpf: alunoEntity.cpf,
        naturalidade: alunoEntity.naturalidade,
        nacionalidade: alunoEntity.nacionalidade,
        sexo: alunoEntity.sexo,
        corRaca: alunoEntity.corRaca,
        tipoSanguineo: alunoEntity.tipoSanguineo,
        alergias: alunoEntity.alergias,
        medicamentos: alunoEntity.medicamentos,
        doencas: alunoEntity.doencas,
        carteiraVacina: alunoEntity.carteiraVacina,
        observacoesSaude: alunoEntity.observacoesSaude,
        updatedAt: new Date(),
      })
      .where(eq(aluno.id, alunoEntity.id))
      .returning();

    return Aluno.create({
      id: result.id,
      idGlobal: result.idGlobal,
      nome: result.nome,
      dataNascimento: result.dataNascimento,
      etapa: result.etapa as any,
      status: result.status as any,
      necessidadesEspeciais: result.necessidadesEspeciais,
      observacoes: result.observacoes,
      rg: result.rg,
      cpf: result.cpf,
      naturalidade: result.naturalidade,
      nacionalidade: result.nacionalidade,
      sexo: result.sexo,
      corRaca: result.corRaca,
      tipoSanguineo: result.tipoSanguineo,
      alergias: result.alergias,
      medicamentos: result.medicamentos,
      doencas: result.doencas,
      carteiraVacina: result.carteiraVacina,
      observacoesSaude: result.observacoesSaude,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(aluno).where(eq(aluno.id, id));
  }
}

import { Responsavel } from "../../domain/entities/responsavel.entity";
import { ResponsavelRepository } from "../../domain/repositories";
import { db } from "../database/database.config";
import { responsavel } from "@matrifacil-/db/schema/matriculas";
import { eq } from "drizzle-orm";

export class DrizzleResponsavelRepository implements ResponsavelRepository {
  async findById(id: string): Promise<Responsavel | null> {
    const [result] = await db
      .select()
      .from(responsavel)
      .where(eq(responsavel.id, id))
      .limit(1);

    if (!result) return null;

    return Responsavel.create({
      id: result.id,
      idGlobal: result.idGlobal,
      nome: result.nome,
      cpf: result.cpf,
      telefone: result.telefone,
      endereco: result.endereco,
      bairro: result.bairro,
      email: result.email,
      parentesco: result.parentesco,
      autorizadoRetirada: result.autorizadoRetirada,
    });
  }

  async findByCPF(cpf: string): Promise<Responsavel | null> {
    const [result] = await db
      .select()
      .from(responsavel)
      .where(eq(responsavel.cpf, cpf))
      .limit(1);

    if (!result) return null;

    return Responsavel.create({
      id: result.id,
      idGlobal: result.idGlobal,
      nome: result.nome,
      cpf: result.cpf,
      telefone: result.telefone,
      endereco: result.endereco,
      bairro: result.bairro,
      email: result.email,
      parentesco: result.parentesco,
      autorizadoRetirada: result.autorizadoRetirada,
    });
  }

  async findByMatriculaId(matriculaId: string): Promise<Responsavel | null> {
    return null;
  }

  async save(responsavelEntity: Responsavel): Promise<Responsavel> {
    const [result] = await db
      .insert(responsavel)
      .values({
        id: responsavelEntity.id,
        idGlobal: responsavelEntity.idGlobal,
        nome: responsavelEntity.nome,
        cpf: responsavelEntity.cpf,
        telefone: responsavelEntity.telefone,
        endereco: responsavelEntity.endereco,
        bairro: responsavelEntity.bairro,
        email: responsavelEntity.email,
        parentesco: responsavelEntity.parentesco,
        autorizadoRetirada: responsavelEntity.autorizadoRetirada,
        rg: responsavelEntity.rg,
        dataNascimento: responsavelEntity.dataNascimento,
        naturalidade: responsavelEntity.naturalidade,
        nacionalidade: responsavelEntity.nacionalidade,
        sexo: responsavelEntity.sexo,
        estadoCivil: responsavelEntity.estadoCivil,
        profissao: responsavelEntity.profissao,
        localTrabalho: responsavelEntity.localTrabalho,
        telefoneTrabalho: responsavelEntity.telefoneTrabalho,
        contatoEmergencia: responsavelEntity.contatoEmergencia,
        telefoneEmergencia: responsavelEntity.telefoneEmergencia,
        parentescoEmergencia: responsavelEntity.parentescoEmergencia,
        createdAt: responsavelEntity.createdAt,
        updatedAt: responsavelEntity.updatedAt,
      })
      .returning();

    return Responsavel.create({
      id: result.id,
      idGlobal: result.idGlobal,
      nome: result.nome,
      cpf: result.cpf,
      telefone: result.telefone,
      endereco: result.endereco,
      bairro: result.bairro,
      email: result.email,
      parentesco: result.parentesco,
      autorizadoRetirada: result.autorizadoRetirada,
    });
  }

  async update(responsavelEntity: Responsavel): Promise<Responsavel> {
    const [result] = await db
      .update(responsavel)
      .set({
        nome: responsavelEntity.nome,
        cpf: responsavelEntity.cpf,
        telefone: responsavelEntity.telefone,
        endereco: responsavelEntity.endereco,
        bairro: responsavelEntity.bairro,
        email: responsavelEntity.email,
        parentesco: responsavelEntity.parentesco,
        autorizadoRetirada: responsavelEntity.autorizadoRetirada,
        updatedAt: new Date(),
      })
      .where(eq(responsavel.id, responsavelEntity.id))
      .returning();

    return Responsavel.create({
      id: result.id,
      idGlobal: result.idGlobal,
      nome: result.nome,
      cpf: result.cpf,
      telefone: result.telefone,
      endereco: result.endereco,
      bairro: result.bairro,
      email: result.email,
      parentesco: result.parentesco,
      autorizadoRetirada: result.autorizadoRetirada,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(responsavel).where(eq(responsavel.id, id));
  }
}

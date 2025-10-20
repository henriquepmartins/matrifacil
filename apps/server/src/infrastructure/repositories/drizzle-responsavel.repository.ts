import { Responsavel } from "../../domain/entities/responsavel.entity";
import { ResponsavelRepository } from "../../domain/repositories";
import { preMatriculaRepository } from "../../repositories/pre-matricula.repository.js";

export class DrizzleResponsavelRepository implements ResponsavelRepository {
  async findById(id: string): Promise<Responsavel | null> {
    return null;
  }

  async findByCPF(cpf: string): Promise<Responsavel | null> {
    const result = await preMatriculaRepository.findResponsavelByCPF(cpf);
    if (!result) return null;

    return Responsavel.create({
      id: result.id,
      idGlobal: result.id,
      nome: "Responsável",
      cpf: cpf,
      telefone: "11999999999",
      endereco: "Endereço",
      bairro: "Bairro",
    });
  }

  async findByMatriculaId(matriculaId: string): Promise<Responsavel | null> {
    return null;
  }

  async save(responsavel: Responsavel): Promise<Responsavel> {
    return responsavel;
  }

  async update(responsavel: Responsavel): Promise<Responsavel> {
    return responsavel;
  }

  async delete(id: string): Promise<void> {}
}

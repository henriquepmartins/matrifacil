import { Matricula } from "../../domain/entities/matricula.entity";
import { MatriculaRepository } from "../../domain/repositories";
import { preMatriculaRepository } from "../../repositories/pre-matricula.repository.js";

export class DrizzleMatriculaRepository implements MatriculaRepository {
  async findById(id: string): Promise<Matricula | null> {
    const result = await preMatriculaRepository.findByIdAny(id);
    if (!result) return null;

    return Matricula.create({
      id: result.id,
      idGlobal: result.id,
      protocoloLocal: result.protocoloLocal,
      aluno: {
        id: result.aluno.id,
        idGlobal: result.aluno.id,
        nome: result.aluno.nome,
        dataNascimento: result.aluno.dataNascimento,
        etapa: result.aluno.etapa as any,
        status: result.status as any,
        necessidadesEspeciais: result.aluno.necessidadesEspeciais,
        observacoes: result.aluno.observacoes,
      } as any,
      responsavel: {
        id: result.responsavel.id,
        idGlobal: result.responsavel.id,
        nome: result.responsavel.nome,
        cpf: result.responsavel.cpf,
        telefone: result.responsavel.telefone,
        endereco: result.responsavel.endereco,
        bairro: result.responsavel.bairro,
        email: result.responsavel.email,
        parentesco: result.responsavel.parentesco,
        autorizadoRetirada: result.responsavel.autorizadoRetirada,
      } as any,
      turma: result.turma
        ? ({
            id: result.turma.id,
            idGlobal: result.turma.id,
            etapa: result.turma.etapa,
            turno: result.turma.turno as any,
            capacidade: 20,
            vagasDisponiveis: 5,
            anoLetivo: "2024",
            nome: result.turma.nome,
            ativa: true,
          } as any)
        : undefined,
      status: result.status as any,
      dataMatricula: result.dataMatricula,
      observacoes: result.observacoes,
    });
  }

  async findByProtocolo(protocolo: string): Promise<Matricula | null> {
    return null;
  }

  async findByStatus(status: string): Promise<Matricula[]> {
    const results = await preMatriculaRepository.findAllMatriculas({ status });
    return results.map(this.mapToMatricula);
  }

  async findByEtapa(etapa: string): Promise<Matricula[]> {
    const results = await preMatriculaRepository.findAllMatriculas({ etapa });
    return results.map(this.mapToMatricula);
  }

  async findBySearch(search: string): Promise<Matricula[]> {
    const results = await preMatriculaRepository.findAllMatriculas({ search });
    return results.map(this.mapToMatricula);
  }

  async findAll(filters?: any): Promise<Matricula[]> {
    const results = await preMatriculaRepository.findAllMatriculas(filters);
    return results.map(this.mapToMatricula);
  }

  async count(filters?: any): Promise<number> {
    const results = await preMatriculaRepository.findAllMatriculas(filters);
    return results.length;
  }

  async save(matricula: Matricula): Promise<Matricula> {
    return matricula;
  }

  async update(matricula: Matricula): Promise<Matricula> {
    return matricula;
  }

  async delete(id: string): Promise<void> {
    await preMatriculaRepository.deleteMatricula(id);
  }

  private mapToMatricula(result: any): Matricula {
    return Matricula.create({
      id: result.id,
      idGlobal: result.id,
      protocoloLocal: result.protocoloLocal,
      aluno: {
        id: result.aluno.id,
        idGlobal: result.aluno.id,
        nome: result.aluno.nome,
        dataNascimento: result.aluno.dataNascimento,
        etapa: result.aluno.etapa as any,
        status: result.status as any,
        necessidadesEspeciais: result.aluno.necessidadesEspeciais,
        observacoes: result.aluno.observacoes,
      } as any,
      responsavel: {
        id: result.responsavel.id,
        idGlobal: result.responsavel.id,
        nome: result.responsavel.nome,
        cpf: result.responsavel.cpf,
        telefone: result.responsavel.telefone,
        endereco: result.responsavel.endereco,
        bairro: result.responsavel.bairro,
        email: result.responsavel.email,
        parentesco: result.responsavel.parentesco,
        autorizadoRetirada: result.responsavel.autorizadoRetirada,
      } as any,
      turma: result.turma
        ? ({
            id: result.turma.id,
            idGlobal: result.turma.id,
            etapa: result.turma.etapa,
            turno: result.turma.turno as any,
            capacidade: 20,
            vagasDisponiveis: 5,
            anoLetivo: "2024",
            nome: result.turma.nome,
            ativa: true,
          } as any)
        : undefined,
      status: result.status as any,
      dataMatricula: result.dataMatricula,
      observacoes: result.observacoes,
    });
  }
}

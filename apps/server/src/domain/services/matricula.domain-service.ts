import { Aluno } from "../entities/aluno.entity";
import { Responsavel } from "../entities/responsavel.entity";
import { Matricula } from "../entities/matricula.entity";
import { Turma } from "../entities/matricula.entity";
import { CPF } from "../value-objects/cpf.value-object";
import { Email } from "../value-objects/email.value-object";
import { Telefone } from "../value-objects/telefone.value-object";
import { Protocolo } from "../value-objects/protocolo.value-object";

export class MatriculaDomainService {
  validateAlunoData(data: {
    nome: string;
    dataNascimento: Date;
    etapa: string;
  }): void {
    if (!data.nome || data.nome.trim().length < 2) {
      throw new Error(
        "Nome do aluno é obrigatório e deve ter pelo menos 2 caracteres"
      );
    }

    if (!data.dataNascimento) {
      throw new Error("Data de nascimento do aluno é obrigatória");
    }

    const age =
      new Date().getFullYear() - new Date(data.dataNascimento).getFullYear();
    if (age < 0 || age > 18) {
      throw new Error("Idade do aluno deve estar entre 0 e 18 anos");
    }

    if (!data.etapa) {
      throw new Error("Etapa educacional é obrigatória");
    }
  }

  validateResponsavelData(data: {
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    bairro: string;
    email?: string;
  }): void {
    if (!data.nome || data.nome.trim().length < 2) {
      throw new Error(
        "Nome do responsável é obrigatório e deve ter pelo menos 2 caracteres"
      );
    }

    try {
      new CPF(data.cpf);
    } catch {
      throw new Error("CPF do responsável é obrigatório e deve ser válido");
    }

    try {
      new Telefone(data.telefone);
    } catch {
      throw new Error(
        "Telefone do responsável é obrigatório e deve ser válido"
      );
    }

    if (!data.endereco || data.endereco.trim().length < 5) {
      throw new Error(
        "Endereço do responsável é obrigatório e deve ter pelo menos 5 caracteres"
      );
    }

    if (!data.bairro || data.bairro.trim().length < 2) {
      throw new Error(
        "Bairro do responsável é obrigatório e deve ter pelo menos 2 caracteres"
      );
    }

    if (data.email) {
      try {
        new Email(data.email);
      } catch {
        throw new Error("Email do responsável deve ser válido");
      }
    }
  }

  canConvertToMatriculaCompleta(matricula: Matricula): boolean {
    return matricula.status === "pre";
  }

  canApproveMatricula(matricula: Matricula): boolean {
    return matricula.status !== "completo";
  }

  generateProtocolo(year: number, sequence: number): Protocolo {
    return Protocolo.generate(year, sequence);
  }

  assignTurmaToMatricula(matricula: Matricula, turma: Turma): Matricula {
    if (!turma.temVagasDisponiveis()) {
      throw new Error("Turma não possui vagas disponíveis");
    }

    if (turma.etapa !== matricula.aluno.etapa) {
      throw new Error("Turma não é compatível com a etapa do aluno");
    }

    return new Matricula(
      matricula.id,
      matricula.idGlobal,
      matricula.protocoloLocal,
      matricula.aluno,
      matricula.responsavel,
      turma,
      matricula.status,
      matricula.dataMatricula,
      matricula.observacoes,
      matricula.createdAt,
      new Date()
    );
  }
}

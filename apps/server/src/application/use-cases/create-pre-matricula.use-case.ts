import { Aluno } from "../../domain/entities/aluno.entity";
import { Responsavel } from "../../domain/entities/responsavel.entity";
import { Matricula } from "../../domain/entities/matricula.entity";
import {
  MatriculaRepository,
  ResponsavelRepository,
  TurmaRepository,
} from "../../domain/repositories";
import { MatriculaDomainService } from "../../domain/services/matricula.domain-service";
import { v4 as uuidv4 } from "uuid";

export interface CreatePreMatriculaRequest {
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

export interface CreatePreMatriculaResponse {
  matricula: Matricula;
}

export class CreatePreMatriculaUseCase {
  constructor(
    private matriculaRepository: MatriculaRepository,
    private responsavelRepository: ResponsavelRepository,
    private turmaRepository: TurmaRepository,
    private domainService: MatriculaDomainService
  ) {}

  async execute(
    request: CreatePreMatriculaRequest
  ): Promise<CreatePreMatriculaResponse> {
    this.domainService.validateAlunoData(request.aluno);
    this.domainService.validateResponsavelData(request.responsavel);

    const existingResponsavel = await this.responsavelRepository.findByCPF(
      request.responsavel.cpf
    );
    if (existingResponsavel) {
      throw new Error("Já existe uma pré-matrícula com este CPF");
    }

    const alunoId = uuidv4();
    const responsavelId = uuidv4();
    const matriculaId = uuidv4();

    const aluno = Aluno.create({
      id: alunoId,
      idGlobal: uuidv4(),
      nome: request.aluno.nome,
      dataNascimento: request.aluno.dataNascimento,
      etapa: request.aluno.etapa,
      necessidadesEspeciais: request.aluno.necessidadesEspeciais || false,
      observacoes: request.aluno.observacoes,
    });

    const responsavel = Responsavel.create({
      id: responsavelId,
      idGlobal: uuidv4(),
      nome: request.responsavel.nome,
      cpf: request.responsavel.cpf,
      telefone: request.responsavel.telefone,
      endereco: request.responsavel.endereco,
      bairro: request.responsavel.bairro,
      email: request.responsavel.email,
      parentesco: request.responsavel.parentesco || "pai",
      autorizadoRetirada: request.responsavel.autorizadoRetirada ?? true,
    });

    const year = new Date().getFullYear();
    const existingMatriculas = await this.matriculaRepository.findAll({
      search: `PRE-${year}`,
    });
    const nextSequence = existingMatriculas.length + 1;
    const protocolo = this.domainService.generateProtocolo(year, nextSequence);

    const matricula = Matricula.create({
      id: matriculaId,
      idGlobal: uuidv4(),
      protocoloLocal: protocolo.toString(),
      aluno,
      responsavel,
      observacoes: request.observacoes,
    });

    await this.responsavelRepository.save(responsavel);
    await this.matriculaRepository.save(matricula);

    return { matricula };
  }
}

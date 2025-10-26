import { Aluno } from "../../domain/entities/aluno.entity";
import { Responsavel } from "../../domain/entities/responsavel.entity";
import { Matricula } from "../../domain/entities/matricula.entity";
import type {
  AlunoRepository,
  MatriculaRepository,
  ResponsavelRepository,
  TurmaRepository,
} from "../../domain/repositories";
import { MatriculaDomainService } from "../../domain/services/matricula.domain-service";
import { v4 as uuidv4 } from "uuid";
import { preMatriculaRepository } from "../../repositories/pre-matricula.repository.js";

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
    private alunoRepository: AlunoRepository,
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

    // Usar o repositório antigo que funciona
    const result = await preMatriculaRepository.createPreMatricula(request);

    return { matricula: result as any };
  }
}

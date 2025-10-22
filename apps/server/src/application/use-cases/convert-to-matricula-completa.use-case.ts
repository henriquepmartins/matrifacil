import { Matricula } from "../../domain/entities/matricula.entity";
import type {
  MatriculaRepository,
  TurmaRepository,
} from "../../domain/repositories";
import { MatriculaDomainService } from "../../domain/services/matricula.domain-service";
import { TurmaVagasService } from "../../domain/services/turma-vagas.service";

export interface ConvertToMatriculaCompletaRequest {
  matriculaId: string;
  turmaId?: string;
  dataMatricula?: Date;
}

export interface ConvertToMatriculaCompletaResponse {
  matricula: Matricula;
}

export class ConvertToMatriculaCompletaUseCase {
  constructor(
    private matriculaRepository: MatriculaRepository,
    private turmaRepository: TurmaRepository,
    private domainService: MatriculaDomainService,
    private turmaVagasService: TurmaVagasService
  ) {}

  async execute(
    request: ConvertToMatriculaCompletaRequest
  ): Promise<ConvertToMatriculaCompletaResponse> {
    const matricula = await this.matriculaRepository.findById(
      request.matriculaId
    );
    if (!matricula) {
      throw new Error("Pré-matrícula não encontrada");
    }

    if (!this.domainService.canConvertToMatriculaCompleta(matricula)) {
      throw new Error("Apenas pré-matrículas podem ser convertidas");
    }

    // A seleção de turma é obrigatória para criar a matrícula
    if (!request.turmaId) {
      throw new Error(
        "A seleção de turma é obrigatória para criar a matrícula"
      );
    }

    const turmaId = request.turmaId;

    // Validar e decrementar vaga da turma, retornando a turma validada
    const turma = await this.turmaVagasService.validarEDecrementarVagaComTurma(
      turmaId,
      matricula.aluno.etapa
    );

    const matriculaCompleta = matricula.converterParaCompleta(
      turma,
      request.dataMatricula
    );
    const updatedMatricula = await this.matriculaRepository.update(
      matriculaCompleta
    );

    return { matricula: updatedMatricula };
  }
}

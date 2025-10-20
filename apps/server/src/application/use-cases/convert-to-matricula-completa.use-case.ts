import { Matricula } from "../../domain/entities/matricula.entity";
import {
  MatriculaRepository,
  TurmaRepository,
} from "../../domain/repositories";
import { MatriculaDomainService } from "../../domain/services/matricula.domain-service";

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
    private domainService: MatriculaDomainService
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

    let turma = matricula.turma;
    if (request.turmaId) {
      turma = await this.turmaRepository.findById(request.turmaId);
      if (!turma) {
        throw new Error("Turma não encontrada");
      }
    } else if (!turma) {
      turma = await this.turmaRepository.findBestForEtapa(
        matricula.aluno.etapa
      );
      if (!turma) {
        throw new Error("Nenhuma turma disponível para esta etapa");
      }
    }

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

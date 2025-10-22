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

    let turmaId = request.turmaId;

    // Se não foi fornecida turma, buscar a melhor turma disponível
    if (!turmaId) {
      turmaId = await this.turmaVagasService.encontrarMelhorTurma(
        matricula.aluno.etapa
      );
      if (!turmaId) {
        throw new Error("Nenhuma turma disponível para esta etapa");
      }
    }

    // Validar e decrementar vaga da turma
    await this.turmaVagasService.validarEDecrementarVaga(
      turmaId,
      matricula.aluno.etapa
    );

    // Buscar dados completos da turma
    const turma = await this.turmaRepository.findById(turmaId);
    if (!turma) {
      throw new Error("Erro ao buscar dados da turma");
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

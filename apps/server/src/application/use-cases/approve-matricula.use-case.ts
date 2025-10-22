import { Matricula } from "../../domain/entities/matricula.entity";
import type {
  MatriculaRepository,
  TurmaRepository,
} from "../../domain/repositories";
import { MatriculaDomainService } from "../../domain/services/matricula.domain-service";
import { TurmaVagasService } from "../../domain/services/turma-vagas.service";

export interface ApproveMatriculaRequest {
  matriculaId: string;
  turmaId?: string;
}

export interface ApproveMatriculaResponse {
  matricula: Matricula;
}

export class ApproveMatriculaUseCase {
  constructor(
    private matriculaRepository: MatriculaRepository,
    private turmaRepository: TurmaRepository,
    private domainService: MatriculaDomainService,
    private turmaVagasService: TurmaVagasService
  ) {}

  async execute(
    request: ApproveMatriculaRequest
  ): Promise<ApproveMatriculaResponse> {
    const matricula = await this.matriculaRepository.findById(
      request.matriculaId
    );
    if (!matricula) {
      throw new Error("Matrícula não encontrada");
    }

    if (!this.domainService.canApproveMatricula(matricula)) {
      throw new Error("Matrícula já está aprovada");
    }

    let turma = matricula.turma;
    let turmaId = request.turmaId;

    // Se turmaId foi fornecido, validar e usar essa turma
    if (turmaId) {
      await this.turmaVagasService.validarTurmaCompleta(
        turmaId,
        matricula.aluno.etapa
      );
      await this.turmaVagasService.validarEDecrementarVaga(
        turmaId,
        matricula.aluno.etapa
      );
      turma = await this.turmaRepository.findById(turmaId);
    } else if (!turma) {
      // Se não tem turma e não foi fornecida, buscar melhor turma
      turmaId = await this.turmaVagasService.encontrarMelhorTurma(
        matricula.aluno.etapa
      );
      if (!turmaId) {
        throw new Error("Nenhuma turma disponível para esta etapa");
      }
      await this.turmaVagasService.validarEDecrementarVaga(
        turmaId,
        matricula.aluno.etapa
      );
      turma = await this.turmaRepository.findById(turmaId);
    }

    if (!turma) {
      throw new Error("Erro ao buscar dados da turma");
    }

    const matriculaAprovada = matricula.aprovar();
    // Atualizar turma na matrícula aprovada
    const matriculaComTurma = new Matricula(
      matriculaAprovada.id,
      matriculaAprovada.idGlobal,
      matriculaAprovada.protocoloLocal,
      matriculaAprovada.aluno,
      matriculaAprovada.responsavel,
      turma,
      matriculaAprovada.status,
      matriculaAprovada.dataMatricula,
      matriculaAprovada.observacoes,
      matriculaAprovada.createdAt,
      matriculaAprovada.updatedAt
    );

    const updatedMatricula = await this.matriculaRepository.update(
      matriculaComTurma
    );

    return { matricula: updatedMatricula };
  }
}

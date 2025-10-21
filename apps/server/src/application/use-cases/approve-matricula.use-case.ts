import { Matricula } from "../../domain/entities/matricula.entity";
import type { MatriculaRepository } from "../../domain/repositories";
import { MatriculaDomainService } from "../../domain/services/matricula.domain-service";

export interface ApproveMatriculaRequest {
  matriculaId: string;
}

export interface ApproveMatriculaResponse {
  matricula: Matricula;
}

export class ApproveMatriculaUseCase {
  constructor(
    private matriculaRepository: MatriculaRepository,
    private domainService: MatriculaDomainService
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

    const matriculaAprovada = matricula.aprovar();
    const updatedMatricula = await this.matriculaRepository.update(
      matriculaAprovada
    );

    return { matricula: updatedMatricula };
  }
}

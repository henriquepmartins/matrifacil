import { Matricula } from "../../domain/entities/matricula.entity";
import { MatriculaRepository } from "../../domain/repositories";
import { MatriculaDomainService } from "../../domain/services/matricula.domain-service";

export interface GetMatriculasRequest {
  status?: string;
  etapa?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetMatriculasResponse {
  matriculas: Matricula[];
  total: number;
}

export class GetMatriculasUseCase {
  constructor(
    private matriculaRepository: MatriculaRepository,
    private domainService: MatriculaDomainService
  ) {}

  async execute(request: GetMatriculasRequest): Promise<GetMatriculasResponse> {
    const matriculas = await this.matriculaRepository.findAll({
      status: request.status,
      etapa: request.etapa,
      search: request.search,
      limit: request.limit,
      offset: request.offset,
    });

    const total = await this.matriculaRepository.count({
      status: request.status,
      etapa: request.etapa,
      search: request.search,
    });

    return { matriculas, total };
  }
}

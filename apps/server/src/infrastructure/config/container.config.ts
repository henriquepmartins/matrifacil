import { DrizzleAlunoRepository } from "../repositories/drizzle-aluno.repository";
import { DrizzleMatriculaRepository } from "../repositories/drizzle-matricula.repository";
import { DrizzleResponsavelRepository } from "../repositories/drizzle-responsavel.repository";
import { DrizzleTurmaRepository } from "../repositories/drizzle-turma.repository";
import { CreatePreMatriculaUseCase } from "../../application/use-cases/create-pre-matricula.use-case";
import { ConvertToMatriculaCompletaUseCase } from "../../application/use-cases/convert-to-matricula-completa.use-case";
import { GetMatriculasUseCase } from "../../application/use-cases/get-matriculas.use-case";
import { ApproveMatriculaUseCase } from "../../application/use-cases/approve-matricula.use-case";
import { MatriculaDomainService } from "../../domain/services/matricula.domain-service";
import { MatriculaController } from "../../adapters/web/matricula.controller";

export class Container {
  private static instance: Container;
  private dependencies: Map<string, any> = new Map();

  private constructor() {
    this.registerDependencies();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerDependencies(): void {
    this.dependencies.set("alunoRepository", new DrizzleAlunoRepository());
    this.dependencies.set(
      "matriculaRepository",
      new DrizzleMatriculaRepository()
    );
    this.dependencies.set(
      "responsavelRepository",
      new DrizzleResponsavelRepository()
    );
    this.dependencies.set("turmaRepository", new DrizzleTurmaRepository());
    this.dependencies.set("domainService", new MatriculaDomainService());

    this.dependencies.set(
      "createPreMatriculaUseCase",
      new CreatePreMatriculaUseCase(
        this.get("matriculaRepository"),
        this.get("responsavelRepository"),
        this.get("turmaRepository"),
        this.get("domainService")
      )
    );

    this.dependencies.set(
      "convertToMatriculaCompletaUseCase",
      new ConvertToMatriculaCompletaUseCase(
        this.get("matriculaRepository"),
        this.get("turmaRepository"),
        this.get("domainService")
      )
    );

    this.dependencies.set(
      "getMatriculasUseCase",
      new GetMatriculasUseCase(
        this.get("matriculaRepository"),
        this.get("domainService")
      )
    );

    this.dependencies.set(
      "approveMatriculaUseCase",
      new ApproveMatriculaUseCase(
        this.get("matriculaRepository"),
        this.get("domainService")
      )
    );

    this.dependencies.set(
      "matriculaController",
      new MatriculaController(
        this.get("createPreMatriculaUseCase"),
        this.get("convertToMatriculaCompletaUseCase"),
        this.get("getMatriculasUseCase"),
        this.get("approveMatriculaUseCase")
      )
    );
  }

  get<T>(key: string): T {
    const dependency = this.dependencies.get(key);
    if (!dependency) {
      throw new Error(`Dependency ${key} not found`);
    }
    return dependency as T;
  }
}

export const container = Container.getInstance();

import { DrizzleAlunoRepository } from "../repositories/drizzle-aluno.repository";
import { DrizzleMatriculaRepository } from "../repositories/drizzle-matricula.repository";
import { DrizzleResponsavelRepository } from "../repositories/drizzle-responsavel.repository";
import { DrizzleTurmaRepository } from "../repositories/drizzle-turma.repository";
import { DrizzleRelatorioRepository } from "../repositories/drizzle-relatorio.repository";
import { CreatePreMatriculaUseCase } from "../../application/use-cases/create-pre-matricula.use-case";
import { ConvertToMatriculaCompletaUseCase } from "../../application/use-cases/convert-to-matricula-completa.use-case";
import { GetMatriculasUseCase } from "../../application/use-cases/get-matriculas.use-case";
import { ApproveMatriculaUseCase } from "../../application/use-cases/approve-matricula.use-case";
import { GetDashboardStatsUseCase } from "../../application/use-cases/get-dashboard-stats.use-case";
import { GerarRelatorioUseCase } from "../../application/use-cases/gerar-relatorio.use-case";
import { ListarRelatoriosGeradosUseCase } from "../../application/use-cases/listar-relatorios-gerados.use-case";
import { MatriculaDomainService } from "../../domain/services/matricula.domain-service";
import { MatriculaController } from "../../adapters/web/matricula.controller";
import { DashboardController } from "../../adapters/web/dashboard.controller";
import { RelatorioController } from "../../adapters/web/relatorio.controller";
import { PdfGeneratorServiceImpl } from "../services/pdf-generator.service";
import { CsvGeneratorServiceImpl } from "../services/csv-generator.service";

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
    // Repositories
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
    this.dependencies.set(
      "relatorioRepository",
      new DrizzleRelatorioRepository()
    );

    // Services
    this.dependencies.set("domainService", new MatriculaDomainService());
    this.dependencies.set("pdfGenerator", new PdfGeneratorServiceImpl());
    this.dependencies.set("csvGenerator", new CsvGeneratorServiceImpl());

    // Use Cases
    this.dependencies.set(
      "createPreMatriculaUseCase",
      new CreatePreMatriculaUseCase(
        this.get("alunoRepository"),
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
      "getDashboardStatsUseCase",
      new GetDashboardStatsUseCase(
        this.get("matriculaRepository"),
        this.get("turmaRepository")
      )
    );

    this.dependencies.set(
      "gerarRelatorioUseCase",
      new GerarRelatorioUseCase(
        this.get("relatorioRepository"),
        this.get("pdfGenerator"),
        this.get("csvGenerator")
      )
    );

    this.dependencies.set(
      "listarRelatoriosUseCase",
      new ListarRelatoriosGeradosUseCase(this.get("relatorioRepository"))
    );

    // Controllers
    this.dependencies.set(
      "matriculaController",
      new MatriculaController(
        this.get("createPreMatriculaUseCase"),
        this.get("convertToMatriculaCompletaUseCase"),
        this.get("getMatriculasUseCase"),
        this.get("approveMatriculaUseCase")
      )
    );

    this.dependencies.set("dashboardController", new DashboardController());

    this.dependencies.set(
      "relatorioController",
      new RelatorioController(
        this.get("gerarRelatorioUseCase"),
        this.get("listarRelatoriosUseCase")
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

import type {
  MatriculaRepository,
  TurmaRepository,
} from "../../domain/repositories";
import { db } from "../../infrastructure/database/database.config";
import {
  matricula,
  aluno,
  documento,
  turma,
} from "@matrifacil-/db/schema/matriculas.js";
import { eq, and, sql } from "drizzle-orm";

export interface DashboardStats {
  totalMatriculas: number;
  preMatriculas: number;
  documentosPendentes: number;
  vagasDisponiveis: number;
  matriculasCompletas: number;
  matriculasPendentes: number;
  totalAlunos: number;
  turmasAtivas: number;
}

export class GetDashboardStatsUseCase {
  constructor(
    private matriculaRepository: MatriculaRepository,
    private turmaRepository: TurmaRepository
  ) {}

  async execute(): Promise<DashboardStats> {
    const [
      totalMatriculasResult,
      preMatriculasResult,
      documentosPendentesResult,
      vagasDisponiveisResult,
      matriculasCompletasResult,
      matriculasPendentesResult,
      totalAlunosResult,
      turmasAtivasResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(matricula),
      db
        .select({ count: sql<number>`count(*)` })
        .from(matricula)
        .where(eq(matricula.status, "pre")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(documento)
        .where(eq(documento.status, "pendente")),
      db
        .select({
          totalVagas: sql<number>`sum(${turma.capacidade})`,
          vagasOcupadas: sql<number>`sum(${turma.capacidade} - ${turma.vagasDisponiveis})`,
        })
        .from(turma)
        .where(eq(turma.ativa, true)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(matricula)
        .where(eq(matricula.status, "completo")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(matricula)
        .where(eq(matricula.status, "pendente_doc")),
      db.select({ count: sql<number>`count(*)` }).from(aluno),
      db
        .select({ count: sql<number>`count(*)` })
        .from(turma)
        .where(eq(turma.ativa, true)),
    ]);

    const totalMatriculas = totalMatriculasResult[0]?.count || 0;
    const preMatriculas = preMatriculasResult[0]?.count || 0;
    const documentosPendentes = documentosPendentesResult[0]?.count || 0;
    const matriculasCompletas = matriculasCompletasResult[0]?.count || 0;
    const matriculasPendentes = matriculasPendentesResult[0]?.count || 0;
    const totalAlunos = totalAlunosResult[0]?.count || 0;
    const turmasAtivas = turmasAtivasResult[0]?.count || 0;

    const vagasData = vagasDisponiveisResult[0];
    const vagasDisponiveis =
      (vagasData?.totalVagas || 0) - (vagasData?.vagasOcupadas || 0);

    return {
      totalMatriculas,
      preMatriculas,
      documentosPendentes,
      vagasDisponiveis: Math.max(0, vagasDisponiveis),
      matriculasCompletas,
      matriculasPendentes,
      totalAlunos,
      turmasAtivas,
    };
  }
}

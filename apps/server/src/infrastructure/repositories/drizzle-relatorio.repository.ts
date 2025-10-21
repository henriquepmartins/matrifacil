import { db } from "@matrifacil-/db/index.js";
import { relatorioGerado } from "@matrifacil-/db/index.js";
import { eq, and, desc, gte, lte, ilike, or, count } from "drizzle-orm";
import type {
  RelatorioRepository,
  RelatorioDataFilters,
} from "../../domain/repositories/relatorio.repository.js";
import { RelatorioEntity } from "../../domain/entities/relatorio.entity.js";
import type { RelatorioMetadata } from "../../domain/entities/relatorio.entity.js";
import type {
  TipoRelatorio,
  FiltrosRelatorio,
} from "../../domain/value-objects/relatorio-filtros.value-object.js";

export class DrizzleRelatorioRepository implements RelatorioRepository {
  async saveMetadata(relatorio: RelatorioEntity): Promise<void> {
    const metadata = relatorio.toMetadata();

    await db.insert(relatorioGerado).values({
      id: metadata.id,
      tipo: metadata.tipo,
      formato: metadata.formato,
      filtros: metadata.filtros as any,
      usuarioId: metadata.usuarioId,
      nomeArquivo: metadata.nomeArquivo,
      tamanhoArquivo: metadata.tamanhoArquivo,
      createdAt: metadata.createdAt,
    });
  }

  async findRecentReports(
    usuarioId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<RelatorioMetadata[]> {
    const reports = await db
      .select()
      .from(relatorioGerado)
      .where(eq(relatorioGerado.usuarioId, usuarioId))
      .orderBy(desc(relatorioGerado.createdAt))
      .limit(limit)
      .offset(offset);

    return reports.map((report) => ({
      id: report.id,
      tipo: report.tipo as TipoRelatorio,
      formato: report.formato as any,
      filtros: report.filtros as FiltrosRelatorio,
      usuarioId: report.usuarioId,
      nomeArquivo: report.nomeArquivo,
      tamanhoArquivo: report.tamanhoArquivo || undefined,
      createdAt: report.createdAt,
    }));
  }

  async countReports(usuarioId: string): Promise<number> {
    const reports = await db
      .select()
      .from(relatorioGerado)
      .where(eq(relatorioGerado.usuarioId, usuarioId));

    return reports.length;
  }

  async getReportData(
    tipo: TipoRelatorio,
    filtros: FiltrosRelatorio
  ): Promise<any[]> {
    switch (tipo) {
      case "matriculas":
        return this.getMatriculasData(filtros);
      case "pre_matriculas":
        return this.getPreMatriculasData(filtros);
      case "turmas":
        return this.getTurmasData(filtros);
      case "documentos":
        return this.getDocumentosData(filtros);
      case "pendencias":
        return this.getPendenciasData(filtros);
      case "geral":
        return this.getGeralData(filtros);
      default:
        throw new Error(`Tipo de relatório não suportado: ${tipo}`);
    }
  }

  private async getMatriculasData(filtros: FiltrosRelatorio): Promise<any[]> {
    const { aluno, responsavel, matricula, turma } = await import(
      "@matrifacil-/db/index.js"
    );

    let query = db
      .select({
        id: matricula.id,
        protocoloLocal: matricula.protocoloLocal,
        status: matricula.status,
        dataMatricula: matricula.dataMatricula,
        observacoes: matricula.observacoes,
        createdAt: matricula.createdAt,
        updatedAt: matricula.updatedAt,
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          dataNascimento: aluno.dataNascimento,
          etapa: aluno.etapa,
          necessidadesEspeciais: aluno.necessidadesEspeciais,
          observacoes: aluno.observacoes,
        },
        responsavel: {
          id: responsavel.id,
          nome: responsavel.nome,
          cpf: responsavel.cpf,
          telefone: responsavel.telefone,
          endereco: responsavel.endereco,
          bairro: responsavel.bairro,
          email: responsavel.email,
          parentesco: responsavel.parentesco,
          autorizadoRetirada: responsavel.autorizadoRetirada,
        },
        turma: {
          id: turma.id,
          nome: turma.nome,
          etapa: turma.etapa,
          turno: turma.turno,
        },
      })
      .from(matricula)
      .innerJoin(aluno, eq(matricula.alunoId, aluno.id))
      .innerJoin(responsavel, eq(matricula.responsavelId, responsavel.id))
      .leftJoin(turma, eq(matricula.turmaId, turma.id));

    // Aplicar filtros
    const conditions = [];

    if (filtros.dataInicio && filtros.dataFim) {
      const campoData =
        filtros.campoData === "dataMatricula"
          ? matricula.dataMatricula
          : matricula.createdAt;

      conditions.push(
        and(gte(campoData, filtros.dataInicio), lte(campoData, filtros.dataFim))
      );
    }

    if (filtros.status && filtros.status !== "todos") {
      conditions.push(eq(matricula.status, filtros.status as any));
    }

    if (filtros.etapa && filtros.etapa !== "todos") {
      conditions.push(eq(aluno.etapa, filtros.etapa as any));
    }

    if (filtros.turma && filtros.turma !== "todos") {
      conditions.push(eq(turma.id, filtros.turma));
    }

    if (filtros.search) {
      conditions.push(
        or(
          ilike(aluno.nome, `%${filtros.search}%`),
          ilike(responsavel.nome, `%${filtros.search}%`),
          ilike(matricula.protocoloLocal, `%${filtros.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  private async getPreMatriculasData(
    filtros: FiltrosRelatorio
  ): Promise<any[]> {
    // Similar ao getMatriculasData mas filtrando apenas status "pre"
    const matriculasData = await this.getMatriculasData({
      ...filtros,
      status: "pre",
    });

    return matriculasData;
  }

  private async getTurmasData(filtros: FiltrosRelatorio): Promise<any[]> {
    const { turma } = await import("@matrifacil-/db/index.js");
    const { eq, and, ilike } = await import("drizzle-orm");

    let query = db.select().from(turma);

    const conditions = [];

    if (filtros.etapa && filtros.etapa !== "todos") {
      conditions.push(eq(turma.etapa, filtros.etapa as any));
    }

    if (filtros.turma && filtros.turma !== "todos") {
      conditions.push(eq(turma.id, filtros.turma));
    }

    if (filtros.search) {
      conditions.push(ilike(turma.nome, `%${filtros.search}%`));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const turmas = await query;

    // Adiciona a contagem de alunos matriculados manualmente
    const { matricula } = await import("@matrifacil-/db/index.js");
    const turmasComContagem = [];
    
    for (const turma of turmas) {
      const alunosCount = await db
        .select({ count: count() })
        .from(matricula)
        .where(eq(matricula.turmaId, turma.id));
      
      turmasComContagem.push({
        ...turma,
        alunosCount: alunosCount[0]?.count || 0
      });
    }

    return turmasComContagem;
  }

  private async getDocumentosData(filtros: FiltrosRelatorio): Promise<any[]> {
    const { documento, matricula, aluno, responsavel } = await import(
      "@matrifacil-/db/index.js"
    );

    let query = db
      .select({
        id: documento.id,
        tipo: documento.tipo,
        status: documento.status,
        nomeArquivo: documento.nomeArquivo,
        tamanhoArquivo: documento.tamanhoArquivo,
        observacoes: documento.observacoes,
        createdAt: documento.createdAt,
        updatedAt: documento.updatedAt,
        matricula: {
          id: matricula.id,
          protocoloLocal: matricula.protocoloLocal,
          aluno: {
            nome: aluno.nome,
            etapa: aluno.etapa,
          },
          responsavel: {
            nome: responsavel.nome,
          },
        },
      })
      .from(documento)
      .innerJoin(matricula, eq(documento.matriculaId, matricula.id))
      .innerJoin(aluno, eq(matricula.alunoId, aluno.id))
      .innerJoin(responsavel, eq(matricula.responsavelId, responsavel.id));

    const conditions = [];

    if (filtros.dataInicio && filtros.dataFim) {
      conditions.push(
        and(
          gte(documento.createdAt, filtros.dataInicio),
          lte(documento.createdAt, filtros.dataFim)
        )
      );
    }

    if (filtros.status && filtros.status !== "todos") {
      conditions.push(eq(documento.status, filtros.status as any));
    }

    if (filtros.search) {
      conditions.push(
        or(
          ilike(aluno.nome, `%${filtros.search}%`),
          ilike(responsavel.nome, `%${filtros.search}%`),
          ilike(matricula.protocoloLocal, `%${filtros.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  private async getPendenciasData(filtros: FiltrosRelatorio): Promise<any[]> {
    const { pendencia, matricula, aluno, responsavel } = await import(
      "@matrifacil-/db/index.js"
    );

    let query = db
      .select({
        id: pendencia.id,
        descricao: pendencia.descricao,
        prazo: pendencia.prazo,
        resolvido: pendencia.resolvido,
        dataResolucao: pendencia.dataResolucao,
        observacoes: pendencia.observacoes,
        createdAt: pendencia.createdAt,
        updatedAt: pendencia.updatedAt,
        matricula: {
          id: matricula.id,
          protocoloLocal: matricula.protocoloLocal,
          aluno: {
            nome: aluno.nome,
            etapa: aluno.etapa,
          },
          responsavel: {
            nome: responsavel.nome,
          },
        },
      })
      .from(pendencia)
      .innerJoin(matricula, eq(pendencia.matriculaId, matricula.id))
      .innerJoin(aluno, eq(matricula.alunoId, aluno.id))
      .innerJoin(responsavel, eq(matricula.responsavelId, responsavel.id));

    const conditions = [];

    if (filtros.dataInicio && filtros.dataFim) {
      conditions.push(
        and(
          gte(pendencia.createdAt, filtros.dataInicio),
          lte(pendencia.createdAt, filtros.dataFim)
        )
      );
    }

    if (filtros.status && filtros.status !== "todos") {
      conditions.push(eq(pendencia.resolvido, filtros.status === "resolvido"));
    }

    if (filtros.search) {
      conditions.push(
        or(
          ilike(aluno.nome, `%${filtros.search}%`),
          ilike(responsavel.nome, `%${filtros.search}%`),
          ilike(matricula.protocoloLocal, `%${filtros.search}%`),
          ilike(pendencia.descricao, `%${filtros.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query;
  }

  private async getGeralData(filtros: FiltrosRelatorio): Promise<any[]> {
    // Relatório geral combina dados de todos os tipos
    const [matriculas, turmas, documentos, pendencias] = await Promise.all([
      this.getMatriculasData(filtros),
      this.getTurmasData(filtros),
      this.getDocumentosData(filtros),
      this.getPendenciasData(filtros),
    ]);

    return {
      matriculas,
      turmas,
      documentos,
      pendencias,
      resumo: {
        totalMatriculas: matriculas.length,
        totalTurmas: turmas.length,
        totalDocumentos: documentos.length,
        totalPendencias: pendencias.length,
        pendenciasResolvidas: pendencias.filter((p) => p.resolvido).length,
        pendenciasPendentes: pendencias.filter((p) => !p.resolvido).length,
      },
    };
  }
}

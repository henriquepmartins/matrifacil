import { stringify } from "csv-stringify";
import type { TipoRelatorio } from "../../domain/value-objects/relatorio-filtros.value-object.js";

export interface CsvGeneratorService {
  generateReport(
    tipo: TipoRelatorio,
    data: any[],
    filtros: any
  ): Promise<Buffer>;
}

export class CsvGeneratorServiceImpl implements CsvGeneratorService {
  async generateReport(
    tipo: TipoRelatorio,
    data: any[],
    filtros: any
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const csvData: any[] = [];

      // Adicionar cabeçalho com informações do relatório
      csvData.push(["Relatório de " + this.getTipoNome(tipo)]);
      csvData.push(["Gerado em: " + new Date().toLocaleString("pt-BR")]);
      csvData.push([]);

      // Adicionar filtros aplicados
      if (filtros) {
        csvData.push(["Filtros aplicados:"]);
        if (filtros.periodo) {
          csvData.push(["Período", filtros.periodo]);
        }
        if (filtros.dataInicio && filtros.dataFim) {
          csvData.push([
            "Data",
            `${filtros.dataInicio.toLocaleDateString(
              "pt-BR"
            )} a ${filtros.dataFim.toLocaleDateString("pt-BR")}`,
          ]);
        }
        if (filtros.status && filtros.status !== "todos") {
          csvData.push(["Status", filtros.status]);
        }
        if (filtros.etapa && filtros.etapa !== "todos") {
          csvData.push(["Etapa", filtros.etapa]);
        }
        csvData.push([]);
      }

      // Adicionar dados específicos do tipo
      const dataRows = this.formatDataForCsv(tipo, data);
      csvData.push(...dataRows);

      stringify(
        csvData,
        {
          delimiter: ";",
          quoted: true,
          encoding: "utf8",
        },
        (err, output) => {
          if (err) {
            reject(err);
          } else {
            resolve(Buffer.from(output, "utf8"));
          }
        }
      );
    });
  }

  private formatDataForCsv(tipo: TipoRelatorio, data: any[]): any[] {
    switch (tipo) {
      case "matriculas":
        return this.formatMatriculasData(data);
      case "pre_matriculas":
        return this.formatMatriculasData(data);
      case "turmas":
        return this.formatTurmasData(data);
      case "documentos":
        return this.formatDocumentosData(data);
      case "pendencias":
        return this.formatPendenciasData(data);
      case "geral":
        return this.formatGeralData(data);
      default:
        return [["Tipo de relatório não suportado"]];
    }
  }

  private formatMatriculasData(data: any[]): any[] {
    if (data.length === 0) {
      return [["Nenhuma matrícula encontrada."]];
    }

    const rows = [];

    // Cabeçalho
    rows.push([
      "Protocolo",
      "Nome do Aluno",
      "Data de Nascimento",
      "Etapa",
      "Nome do Responsável",
      "CPF",
      "Telefone",
      "Email",
      "Endereço",
      "Bairro",
      "Parentesco",
      "Autorizado Retirada",
      "Status",
      "Data da Matrícula",
      "Turma",
      "Necessidades Especiais",
      "Observações da Matrícula",
      "Data de Criação",
      "Data de Atualização"
    ]);

    // Dados
    data.forEach((item) => {
      rows.push([
        item.protocoloLocal || "",
        item.aluno?.nome || "",
        item.aluno?.dataNascimento
          ? new Date(item.aluno.dataNascimento).toLocaleDateString("pt-BR")
          : "",
        item.aluno?.etapa || "",
        item.responsavel?.nome || "",
        item.responsavel?.cpf || "",
        item.responsavel?.telefone || "",
        item.responsavel?.email || "",
        item.responsavel?.endereco || "",
        item.responsavel?.bairro || "",
        item.responsavel?.parentesco || "",
        item.responsavel?.autorizadoRetirada ? "Sim" : "Não",
        item.status || "",
        item.dataMatricula
          ? new Date(item.dataMatricula).toLocaleDateString("pt-BR")
          : "",
        item.turma?.nome || "",
        item.aluno?.necessidadesEspeciais ? "Sim" : "Não",
        item.observacoes || "",
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("pt-BR")
          : "",
        item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString("pt-BR")
          : ""
      ]);
    });

    return rows;
  }

  private formatTurmasData(data: any[]): any[] {
    if (data.length === 0) {
      return [["Nenhuma turma encontrada."]];
    }

    const rows = [];

    // Cabeçalho
    rows.push([
      "ID",
      "Nome",
      "Etapa",
      "Turno",
      "Capacidade",
      "Vagas Disponíveis",
      "Alunos Matriculados",
      "Ano Letivo",
      "Status",
      "Data de Criação",
      "Data de Atualização"
    ]);

    // Dados
    data.forEach((item) => {
      rows.push([
        item.id || "",
        item.nome || "",
        item.etapa || "",
        item.turno || "",
        item.capacidade || "",
        item.vagasDisponiveis || "",
        item.alunosCount || "0",
        item.anoLetivo || "",
        item.ativa ? "Ativa" : "Inativa",
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("pt-BR")
          : "",
        item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString("pt-BR")
          : ""
      ]);
    });

    return rows;
  }

  private formatDocumentosData(data: any[]): any[] {
    if (data.length === 0) {
      return [["Nenhum documento encontrado."]];
    }

    const rows = [];

    // Cabeçalho
    rows.push([
      "ID",
      "Tipo",
      "Status",
      "Nome do Arquivo",
      "Tamanho (bytes)",
      "Aluno",
      "Responsável",
      "Protocolo",
      "Data de Upload",
      "Data de Atualização",
      "Observações"
    ]);

    // Dados
    data.forEach((item) => {
      rows.push([
        item.id || "",
        item.tipo || "",
        item.status || "",
        item.nomeArquivo || "",
        item.tamanhoArquivo || "",
        item.matricula?.aluno?.nome || "",
        item.matricula?.responsavel?.nome || "",
        item.matricula?.protocoloLocal || "",
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("pt-BR")
          : "",
        item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString("pt-BR")
          : "",
        item.observacoes || ""
      ]);
    });

    return rows;
  }

  private formatPendenciasData(data: any[]): any[] {
    if (data.length === 0) {
      return [["Nenhuma pendência encontrada."]];
    }

    const rows = [];

    // Cabeçalho
    rows.push([
      "ID",
      "Descrição",
      "Status",
      "Prazo",
      "Data de Resolução",
      "Aluno",
      "Responsável",
      "Protocolo",
      "Data de Criação",
      "Data de Atualização",
      "Observações"
    ]);

    // Dados
    data.forEach((item) => {
      rows.push([
        item.id || "",
        item.descricao || "",
        item.resolvido ? "Resolvido" : "Pendente",
        item.prazo ? new Date(item.prazo).toLocaleDateString("pt-BR") : "",
        item.dataResolucao
          ? new Date(item.dataResolucao).toLocaleDateString("pt-BR")
          : "",
        item.matricula?.aluno?.nome || "",
        item.matricula?.responsavel?.nome || "",
        item.matricula?.protocoloLocal || "",
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("pt-BR")
          : "",
        item.updatedAt
          ? new Date(item.updatedAt).toLocaleDateString("pt-BR")
          : "",
        item.observacoes || ""
      ]);
    });

    return rows;
  }

  private formatGeralData(data: any): any[] {
    const rows = [];

    // Resumo
    rows.push(["RESUMO GERAL"]);
    rows.push([]);
    rows.push(["Total de Matrículas", data.resumo?.totalMatriculas || 0]);
    rows.push(["Total de Turmas", data.resumo?.totalTurmas || 0]);
    rows.push(["Total de Documentos", data.resumo?.totalDocumentos || 0]);
    rows.push(["Total de Pendências", data.resumo?.totalPendencias || 0]);
    rows.push([
      "Pendências Resolvidas",
      data.resumo?.pendenciasResolvidas || 0,
    ]);
    rows.push(["Pendências Pendentes", data.resumo?.pendenciasPendentes || 0]);
    rows.push([]);

    // Detalhes por categoria
    if (data.matriculas?.length > 0) {
      rows.push(["MATRÍCULAS"]);
      rows.push(...this.formatMatriculasData(data.matriculas));
      rows.push([]);
    }

    if (data.turmas?.length > 0) {
      rows.push(["TURMAS"]);
      rows.push(...this.formatTurmasData(data.turmas));
      rows.push([]);
    }

    if (data.documentos?.length > 0) {
      rows.push(["DOCUMENTOS"]);
      rows.push(...this.formatDocumentosData(data.documentos));
      rows.push([]);
    }

    if (data.pendencias?.length > 0) {
      rows.push(["PENDÊNCIAS"]);
      rows.push(...this.formatPendenciasData(data.pendencias));
    }

    return rows;
  }

  private getTipoNome(tipo: TipoRelatorio): string {
    const nomes = {
      matriculas: "Matrículas",
      pre_matriculas: "Pré-Matrículas",
      turmas: "Turmas",
      documentos: "Documentos",
      pendencias: "Pendências",
      geral: "Geral",
    };

    return nomes[tipo] || tipo;
  }
}

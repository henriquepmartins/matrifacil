import PDFDocument from "pdfkit";
import type { TipoRelatorio } from "../../domain/value-objects/relatorio-filtros.value-object.js";

export interface PdfGeneratorService {
  generateReport(
    tipo: TipoRelatorio,
    data: any[],
    filtros: any
  ): Promise<Buffer>;
}

export class PdfGeneratorServiceImpl implements PdfGeneratorService {
  async generateReport(
    tipo: TipoRelatorio,
    data: any[],
    filtros: any
  ): Promise<Buffer> {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.on("error", reject);

      try {
        this.addHeader(doc, tipo, filtros);
        this.addContent(doc, tipo, data);
        this.addFooter(doc);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(
    doc: InstanceType<typeof PDFDocument>,
    tipo: TipoRelatorio,
    filtros: any
  ): void {
    // Logo/Título
    doc.fontSize(20).font("Helvetica-Bold");
    doc.text("MatriFácil", 50, 50);

    doc.fontSize(16).font("Helvetica");
    doc.text("Relatório de " + this.getTipoNome(tipo), 50, 80);

    // Data de geração
    doc.fontSize(10).font("Helvetica");
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 50, 100);

    // Filtros aplicados
    if (filtros) {
      doc.text("Filtros aplicados:", 50, 120);
      let y = 140;

      if (filtros.periodo) {
        doc.text(`• Período: ${filtros.periodo}`, 70, y);
        y += 20;
      }

      if (filtros.dataInicio && filtros.dataFim) {
        doc.text(
          `• Data: ${filtros.dataInicio.toLocaleDateString(
            "pt-BR"
          )} a ${filtros.dataFim.toLocaleDateString("pt-BR")}`,
          70,
          y
        );
        y += 20;
      }

      if (filtros.status && filtros.status !== "todos") {
        doc.text(`• Status: ${filtros.status}`, 70, y);
        y += 20;
      }

      if (filtros.etapa && filtros.etapa !== "todos") {
        doc.text(`• Etapa: ${filtros.etapa}`, 70, y);
        y += 20;
      }
    }

    // Linha separadora
    doc.moveTo(50, 200).lineTo(550, 200).stroke();
  }

  private addContent(
    doc: InstanceType<typeof PDFDocument>,
    tipo: TipoRelatorio,
    data: any[]
  ): void {
    let y = 220;

    switch (tipo) {
      case "matriculas":
        this.addMatriculasTable(doc, data, y);
        break;
      case "pre_matriculas":
        this.addMatriculasTable(doc, data, y);
        break;
      case "turmas":
        this.addTurmasTable(doc, data, y);
        break;
      case "documentos":
        this.addDocumentosTable(doc, data, y);
        break;
      case "pendencias":
        this.addPendenciasTable(doc, data, y);
        break;
      case "geral":
        this.addGeralContent(doc, data, y);
        break;
    }
  }

  private addMatriculasTable(
    doc: InstanceType<typeof PDFDocument>,
    data: any[],
    startY: number
  ): void {
    if (data.length === 0) {
      doc.fontSize(12).text("Nenhuma matrícula encontrada.", 50, startY);
      return;
    }

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`Total de registros: ${data.length}`, 50, startY);

    // Adiciona colunas mais detalhadas
    let y = startY + 30;

    // Cabeçalho da tabela
    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("Protocolo", 50, y);
    doc.text("Aluno", 110, y);
    doc.text("Dt. Nasc", 180, y);
    doc.text("Etapa", 240, y);
    doc.text("Resp", 290, y);
    doc.text("CPF Resp", 350, y);
    doc.text("Status", 420, y);
    doc.text("Dt. Matr", 460, y);
    doc.text("Turma", 500, y);

    y += 12;

    // Linha separadora
    doc.moveTo(50, y).lineTo(540, y).stroke();
    y += 5;

    // Dados
    doc.fontSize(8).font("Helvetica");
    data.forEach((item, index) => {
      if (y > 700) {
        // Nova página
        doc.addPage();
        y = 50;
      }

      doc.text(item.protocoloLocal || "", 50, y);
      doc.text(item.aluno?.nome.substring(0, 15) || "", 110, y); // Limitar nome
      doc.text(
        item.aluno?.dataNascimento
          ? new Date(item.aluno.dataNascimento).toLocaleDateString("pt-BR")
          : "",
        180,
        y
      );
      doc.text(item.aluno?.etapa || "", 240, y);
      doc.text(item.responsavel?.nome.substring(0, 10) || "", 290, y); // Limitar nome
      doc.text(item.responsavel?.cpf || "", 350, y);
      doc.text(item.status || "", 420, y);
      doc.text(
        item.dataMatricula
          ? new Date(item.dataMatricula).toLocaleDateString("pt-BR")
          : "",
        460,
        y
      );
      doc.text(item.turma?.nome.substring(0, 8) || "", 500, y); // Limitar nome da turma

      y += 12;

      if (index < data.length - 1) {
        doc.moveTo(50, y).lineTo(540, y).stroke();
        y += 3;
      }
    });
  }

  private addTurmasTable(
    doc: InstanceType<typeof PDFDocument>,
    data: any[],
    startY: number
  ): void {
    if (data.length === 0) {
      doc.fontSize(12).text("Nenhuma turma encontrada.", 50, startY);
      return;
    }

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`Total de turmas: ${data.length}`, 50, startY);

    // Adiciona colunas mais detalhadas
    let y = startY + 30;

    // Cabeçalho da tabela
    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("Nome", 50, y);
    doc.text("Etapa", 150, y);
    doc.text("Turno", 220, y);
    doc.text("Capacidade", 270, y);
    doc.text("Vagas Disp", 340, y);
    doc.text("Ano Letivo", 410, y);
    doc.text("Status", 480, y);
    doc.text("Alunos", 530, y);

    y += 12;
    doc.moveTo(50, y).lineTo(560, y).stroke();
    y += 5;

    // Dados
    doc.fontSize(8).font("Helvetica");
    data.forEach((item, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(item.nome || "", 50, y);
      doc.text(item.etapa || "", 150, y);
      doc.text(item.turno || "", 220, y);
      doc.text(item.capacidade?.toString() || "", 270, y);
      doc.text(item.vagasDisponiveis?.toString() || "", 340, y);
      doc.text(item.anoLetivo?.toString() || "", 410, y);
      doc.text(item.ativa ? "Ativa" : "Inativa", 480, y);
      doc.text(item.alunosCount?.toString() || "0", 530, y);

      y += 12;

      if (index < data.length - 1) {
        doc.moveTo(50, y).lineTo(560, y).stroke();
        y += 3;
      }
    });
  }

  private addDocumentosTable(
    doc: InstanceType<typeof PDFDocument>,
    data: any[],
    startY: number
  ): void {
    if (data.length === 0) {
      doc.fontSize(12).text("Nenhum documento encontrado.", 50, startY);
      return;
    }

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`Total de documentos: ${data.length}`, 50, startY);

    // Adiciona colunas mais detalhadas
    let y = startY + 30;

    // Cabeçalho da tabela
    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("Tipo", 50, y);
    doc.text("Status", 120, y);
    doc.text("Aluno", 180, y);
    doc.text("Resp", 270, y);
    doc.text("Protocolo", 340, y);
    doc.text("Tamanho", 420, y);
    doc.text("Dt. Upload", 480, y);
    doc.text("Nome Arq", 520, y);

    y += 12;
    doc.moveTo(50, y).lineTo(560, y).stroke();
    y += 5;

    // Dados
    doc.fontSize(8).font("Helvetica");
    data.forEach((item, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(item.tipo || "", 50, y);
      doc.text(item.status || "", 120, y);
      doc.text(item.matricula?.aluno?.nome.substring(0, 12) || "", 180, y);
      doc.text(item.matricula?.responsavel?.nome.substring(0, 8) || "", 270, y);
      doc.text(item.matricula?.protocoloLocal || "", 340, y);
      doc.text(
        item.tamanhoArquivo ? `${item.tamanhoArquivo} bytes` : "",
        420,
        y
      );
      doc.text(
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("pt-BR")
          : "",
        480,
        y
      );
      doc.text(item.nomeArquivo.substring(0, 10) || "", 520, y);

      y += 12;

      if (index < data.length - 1) {
        doc.moveTo(50, y).lineTo(560, y).stroke();
        y += 3;
      }
    });
  }

  private addPendenciasTable(
    doc: InstanceType<typeof PDFDocument>,
    data: any[],
    startY: number
  ): void {
    if (data.length === 0) {
      doc.fontSize(12).text("Nenhuma pendência encontrada.", 50, startY);
      return;
    }

    doc.fontSize(12).font("Helvetica-Bold");
    doc.text(`Total de pendências: ${data.length}`, 50, startY);

    // Adiciona colunas mais detalhadas
    let y = startY + 30;

    // Cabeçalho da tabela
    doc.fontSize(8).font("Helvetica-Bold");
    doc.text("Descrição", 50, y);
    doc.text("Status", 230, y);
    doc.text("Dt. Criação", 280, y);
    doc.text("Dt. Resol", 340, y);
    doc.text("Prazo", 400, y);
    doc.text("Aluno", 450, y);
    doc.text("Resp", 520, y);

    y += 12;
    doc.moveTo(50, y).lineTo(560, y).stroke();
    y += 5;

    // Dados
    doc.fontSize(8).font("Helvetica");
    data.forEach((item, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      doc.text(item.descricao.substring(0, 30) || "", 50, y);
      doc.text(item.resolvido ? "Resolvido" : "Pendente", 230, y);
      doc.text(
        item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("pt-BR")
          : "",
        280,
        y
      );
      doc.text(
        item.dataResolucao
          ? new Date(item.dataResolucao).toLocaleDateString("pt-BR")
          : "",
        340,
        y
      );
      doc.text(
        item.prazo ? new Date(item.prazo).toLocaleDateString("pt-BR") : "",
        400,
        y
      );
      doc.text(item.matricula?.aluno?.nome.substring(0, 10) || "", 450, y);
      doc.text(item.matricula?.responsavel?.nome.substring(0, 8) || "", 520, y);

      y += 12;

      if (index < data.length - 1) {
        doc.moveTo(50, y).lineTo(560, y).stroke();
        y += 3;
      }
    });
  }

  private addGeralContent(
    doc: InstanceType<typeof PDFDocument>,
    data: any,
    startY: number
  ): void {
    let y = startY;

    doc.fontSize(14).font("Helvetica-Bold");
    doc.text("Resumo Geral", 50, y);
    y += 30;

    doc.fontSize(12).font("Helvetica");
    doc.text(
      `• Total de Matrículas: ${data.resumo?.totalMatriculas || 0}`,
      70,
      y
    );
    y += 20;
    doc.text(`• Total de Turmas: ${data.resumo?.totalTurmas || 0}`, 70, y);
    y += 20;
    doc.text(
      `• Total de Documentos: ${data.resumo?.totalDocumentos || 0}`,
      70,
      y
    );
    y += 20;
    doc.text(
      `• Total de Pendências: ${data.resumo?.totalPendencias || 0}`,
      70,
      y
    );
    y += 20;
    doc.text(
      `• Pendências Resolvidas: ${data.resumo?.pendenciasResolvidas || 0}`,
      70,
      y
    );
    y += 20;
    doc.text(
      `• Pendências Pendentes: ${data.resumo?.pendenciasPendentes || 0}`,
      70,
      y
    );
  }

  private addFooter(doc: InstanceType<typeof PDFDocument>): void {
    const pageHeight = doc.page.height;
    doc.fontSize(8).font("Helvetica");
    doc.text(
      "MatriFácil - Sistema de Gestão de Matrículas",
      50,
      pageHeight - 30
    );
    doc.text(`Página ${doc.pageNumber || 1}`, 500, pageHeight - 30);
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

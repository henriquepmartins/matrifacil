export type TipoRelatorio =
  | "matriculas"
  | "pre_matriculas"
  | "turmas"
  | "documentos"
  | "pendencias"
  | "geral";

export type FormatoRelatorio = "pdf" | "csv";

export type PeriodoRelatorio =
  | "hoje"
  | "semana_atual"
  | "mes_atual"
  | "ano_atual"
  | "personalizado";

export type CampoDataFiltro = "createdAt" | "dataMatricula";

export interface FiltrosRelatorio {
  periodo: PeriodoRelatorio;
  dataInicio?: Date;
  dataFim?: Date;
  campoData: CampoDataFiltro;
  status?: string;
  etapa?: string;
  turma?: string;
  search?: string;
}

export class RelatorioFiltrosValueObject {
  private readonly _filtros: FiltrosRelatorio;

  constructor(filtros: FiltrosRelatorio) {
    this.validate(filtros);
    this._filtros = this.processPeriod(filtros);
  }

  private validate(filtros: FiltrosRelatorio): void {
    if (!filtros.periodo) {
      throw new Error("Período é obrigatório");
    }

    if (filtros.periodo === "personalizado") {
      if (!filtros.dataInicio || !filtros.dataFim) {
        throw new Error(
          "Data início e fim são obrigatórias para período personalizado"
        );
      }

      if (filtros.dataInicio > filtros.dataFim) {
        throw new Error("Data início deve ser anterior à data fim");
      }
    }

    if (!filtros.campoData) {
      throw new Error("Campo de data para filtro é obrigatório");
    }
  }

  private processPeriod(filtros: FiltrosRelatorio): FiltrosRelatorio {
    const now = new Date();
    const processed = { ...filtros };

    switch (filtros.periodo) {
      case "hoje":
        processed.dataInicio = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        processed.dataFim = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59
        );
        break;

      case "semana_atual":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        processed.dataInicio = startOfWeek;

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        processed.dataFim = endOfWeek;
        break;

      case "mes_atual":
        processed.dataInicio = new Date(now.getFullYear(), now.getMonth(), 1);
        processed.dataFim = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        break;

      case "ano_atual":
        processed.dataInicio = new Date(now.getFullYear(), 0, 1);
        processed.dataFim = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;

      case "personalizado":
        // Mantém as datas fornecidas pelo usuário
        break;
    }

    return processed;
  }

  get filtros(): FiltrosRelatorio {
    return this._filtros;
  }

  get dataInicio(): Date | undefined {
    return this._filtros.dataInicio;
  }

  get dataFim(): Date | undefined {
    return this._filtros.dataFim;
  }

  get campoData(): CampoDataFiltro {
    return this._filtros.campoData;
  }

  get periodo(): PeriodoRelatorio {
    return this._filtros.periodo;
  }

  get status(): string | undefined {
    return this._filtros.status;
  }

  get etapa(): string | undefined {
    return this._filtros.etapa;
  }

  get turma(): string | undefined {
    return this._filtros.turma;
  }

  get search(): string | undefined {
    return this._filtros.search;
  }
}

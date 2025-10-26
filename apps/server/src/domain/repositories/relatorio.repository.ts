import {
  RelatorioEntity,
  RelatorioMetadata,
} from "../entities/relatorio.entity.js";
import {
  TipoRelatorio,
  FormatoRelatorio,
  FiltrosRelatorio,
} from "../value-objects/relatorio-filtros.value-object.js";

export interface RelatorioRepository {
  saveMetadata(relatorio: RelatorioEntity): Promise<void>;

  findRecentReports(
    usuarioId: string,
    limit?: number,
    offset?: number
  ): Promise<RelatorioMetadata[]>;

  getReportData(tipo: TipoRelatorio, filtros: FiltrosRelatorio): Promise<any[]>;

  countReports(usuarioId: string): Promise<number>;
}

export interface RelatorioDataFilters {
  dataInicio?: Date;
  dataFim?: Date;
  campoData: "createdAt" | "dataMatricula";
  status?: string;
  etapa?: string;
  turma?: string;
  search?: string;
}

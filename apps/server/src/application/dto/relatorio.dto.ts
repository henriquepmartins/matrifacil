import { z } from "zod";
import type {
  TipoRelatorio,
  FormatoRelatorio,
  PeriodoRelatorio,
  CampoDataFiltro,
} from "../../domain/value-objects/relatorio-filtros.value-object.js";

export const GerarRelatorioRequestSchema = z.object({
  tipo: z.enum([
    "matriculas",
    "pre_matriculas",
    "turmas",
    "documentos",
    "pendencias",
    "geral",
  ]),
  formato: z.enum(["pdf", "csv"]),
  periodo: z.enum([
    "hoje",
    "semana_atual",
    "mes_atual",
    "ano_atual",
    "personalizado",
  ]),
  dataInicio: z.coerce.date().optional(),
  dataFim: z.coerce.date().optional(),
  campoData: z.enum(["createdAt", "dataMatricula"]),
  status: z.string().optional(),
  etapa: z.string().optional(),
  turma: z.string().optional(),
  search: z.string().optional(),
});

export type GerarRelatorioRequestDto = z.infer<
  typeof GerarRelatorioRequestSchema
>;

export type GerarRelatorioResponseDto = {
  buffer: Buffer;
  nomeArquivo: string;
  contentType: string;
  tamanhoArquivo: number;
};



export const RelatorioMetadataSchema = z.object({
  id: z.string(),
  tipo: z.enum([
    "matriculas",
    "pre_matriculas",
    "turmas",
    "documentos",
    "pendencias",
    "geral",
  ]),
  formato: z.enum(["pdf", "csv"]),
  filtros: z.object({
    periodo: z.enum([
      "hoje",
      "semana_atual",
      "mes_atual",
      "ano_atual",
      "personalizado",
    ]),
    dataInicio: z.date().optional(),
    dataFim: z.date().optional(),
    campoData: z.enum(["createdAt", "dataMatricula"]),
    status: z.string().optional(),
    etapa: z.string().optional(),
    turma: z.string().optional(),
    search: z.string().optional(),
  }),
  usuarioId: z.string(),
  nomeArquivo: z.string(),
  tamanhoArquivo: z.string().optional(),
  createdAt: z.date(),
});

export type RelatorioMetadataDto = z.infer<typeof RelatorioMetadataSchema>;

export const FiltrosRelatorioSchema = z.object({
  periodo: z.enum([
    "hoje",
    "semana_atual",
    "mes_atual",
    "ano_atual",
    "personalizado",
  ]),
  dataInicio: z.date().optional(),
  dataFim: z.date().optional(),
  campoData: z.enum(["createdAt", "dataMatricula"]),
  status: z.string().optional(),
  etapa: z.string().optional(),
  turma: z.string().optional(),
  search: z.string().optional(),
});

export type FiltrosRelatorioDto = z.infer<typeof FiltrosRelatorioSchema>;

export const ListarRelatoriosRequestSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});

export type ListarRelatoriosRequestDto = z.infer<
  typeof ListarRelatoriosRequestSchema
>;

export const ListarRelatoriosResponseSchema = z.object({
  data: z.array(RelatorioMetadataSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type ListarRelatoriosResponseDto = z.infer<
  typeof ListarRelatoriosResponseSchema
>;



import { pgTable, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const tipoRelatorioEnum = pgEnum("tipo_relatorio", [
  "matriculas",
  "pre_matriculas",
  "turmas",
  "documentos",
  "pendencias",
  "geral",
]);

export const formatoRelatorioEnum = pgEnum("formato_relatorio", ["pdf", "csv"]);

export const relatorioGerado = pgTable("relatorio_gerado", {
  id: text("id").primaryKey(),
  tipo: tipoRelatorioEnum("tipo").notNull(),
  formato: formatoRelatorioEnum("formato").notNull(),
  filtros: jsonb("filtros").notNull(),
  usuarioId: text("usuario_id").notNull(),
  nomeArquivo: text("nome_arquivo").notNull(),
  tamanhoArquivo: text("tamanho_arquivo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

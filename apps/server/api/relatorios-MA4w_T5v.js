import { jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

//#region src/schema/relatorios.ts
const tipoRelatorioEnum = pgEnum("tipo_relatorio", [
	"matriculas",
	"pre_matriculas",
	"turmas",
	"documentos",
	"pendencias",
	"geral"
]);
const formatoRelatorioEnum = pgEnum("formato_relatorio", ["pdf", "csv"]);
const relatorioGerado = pgTable("relatorio_gerado", {
	id: text("id").primaryKey(),
	tipo: tipoRelatorioEnum("tipo").notNull(),
	formato: formatoRelatorioEnum("formato").notNull(),
	filtros: jsonb("filtros").notNull(),
	usuarioId: text("usuario_id").notNull(),
	nomeArquivo: text("nome_arquivo").notNull(),
	tamanhoArquivo: text("tamanho_arquivo"),
	createdAt: timestamp("created_at").notNull().defaultNow()
});

//#endregion
export { formatoRelatorioEnum, relatorioGerado, tipoRelatorioEnum };
//# sourceMappingURL=relatorios-MA4w_T5v.js.map
import { boolean, foreignKey, integer, jsonb, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import "drizzle-orm";

//#region src/migrations/schema.ts
const etapa = pgEnum("etapa", [
	"bercario",
	"maternal",
	"pre_escola",
	"fundamental"
]);
const formatoRelatorio = pgEnum("formato_relatorio", ["pdf", "csv"]);
const statusDocumento = pgEnum("status_documento", [
	"pendente",
	"anexado",
	"aprovado"
]);
const statusMatricula = pgEnum("status_matricula", [
	"pre",
	"pendente_doc",
	"completo",
	"concluido"
]);
const tipoDocumento = pgEnum("tipo_documento", [
	"certidao",
	"rg_cpf_resp",
	"vacina",
	"residencia",
	"historico",
	"foto3x4"
]);
const tipoRelatorio = pgEnum("tipo_relatorio", [
	"matriculas",
	"pre_matriculas",
	"turmas",
	"documentos",
	"pendencias",
	"geral"
]);
const turno = pgEnum("turno", [
	"manha",
	"tarde",
	"integral"
]);
const relatorioGerado = pgTable("relatorio_gerado", {
	id: text().primaryKey().notNull(),
	tipo: tipoRelatorio().notNull(),
	formato: formatoRelatorio().notNull(),
	filtros: jsonb().notNull(),
	usuarioId: text("usuario_id").notNull(),
	nomeArquivo: text("nome_arquivo").notNull(),
	tamanhoArquivo: text("tamanho_arquivo"),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull()
});
const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: "string" }).notNull(),
	createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: "string" }).defaultNow().notNull()
});
const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: "string" }),
	refreshTokenExpiresAt: timestamp({ mode: "string" }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: "string" }).defaultNow().notNull()
}, (table) => [foreignKey({
	columns: [table.userId],
	foreignColumns: [user.id],
	name: "account_userId_user_id_fk"
}).onDelete("cascade")]);
const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: "string" }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull()
}, (table) => [foreignKey({
	columns: [table.userId],
	foreignColumns: [user.id],
	name: "session_userId_user_id_fk"
}).onDelete("cascade"), unique("session_token_unique").on(table.token)]);
const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().default(false).notNull(),
	image: text(),
	createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
	role: text().default("RECEPCAO").notNull()
}, (table) => [unique("user_email_unique").on(table.email)]);
const aluno = pgTable("aluno", {
	id: text().primaryKey().notNull(),
	idGlobal: text("id_global"),
	nome: text().notNull(),
	dataNascimento: timestamp("data_nascimento", { mode: "string" }).notNull(),
	etapa: etapa().notNull(),
	status: statusMatricula().default("pre").notNull(),
	necessidadesEspeciais: boolean("necessidades_especiais").default(false).notNull(),
	observacoes: text(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	rg: text(),
	cpf: text(),
	naturalidade: text(),
	nacionalidade: text(),
	sexo: text(),
	corRaca: text("cor_raca"),
	tipoSanguineo: text("tipo_sanguineo"),
	alergias: text(),
	medicamentos: text(),
	doencas: text(),
	carteiraVacina: boolean("carteira_vacina").default(false),
	observacoesSaude: text("observacoes_saude")
}, (table) => [unique("aluno_id_global_unique").on(table.idGlobal)]);
const pendencia = pgTable("pendencia", {
	id: text().primaryKey().notNull(),
	matriculaId: text("matricula_id").notNull(),
	documentoId: text("documento_id"),
	descricao: text().notNull(),
	prazo: timestamp({ mode: "string" }),
	resolvido: boolean().default(false).notNull(),
	dataResolucao: timestamp("data_resolucao", { mode: "string" }),
	observacoes: text(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull()
}, (table) => [foreignKey({
	columns: [table.documentoId],
	foreignColumns: [documento.id],
	name: "pendencia_documento_id_documento_id_fk"
}).onDelete("set null"), foreignKey({
	columns: [table.matriculaId],
	foreignColumns: [matricula.id],
	name: "pendencia_matricula_id_matricula_id_fk"
}).onDelete("cascade")]);
const matricula = pgTable("matricula", {
	id: text().primaryKey().notNull(),
	idGlobal: text("id_global"),
	protocoloLocal: text("protocolo_local").notNull(),
	alunoId: text("aluno_id").notNull(),
	responsavelId: text("responsavel_id").notNull(),
	turmaId: text("turma_id"),
	status: statusMatricula().default("pre").notNull(),
	dataMatricula: timestamp("data_matricula", { mode: "string" }),
	observacoes: text(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull()
}, (table) => [
	foreignKey({
		columns: [table.alunoId],
		foreignColumns: [aluno.id],
		name: "matricula_aluno_id_aluno_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.responsavelId],
		foreignColumns: [responsavel.id],
		name: "matricula_responsavel_id_responsavel_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.turmaId],
		foreignColumns: [turma.id],
		name: "matricula_turma_id_turma_id_fk"
	}).onDelete("set null"),
	unique("matricula_id_global_unique").on(table.idGlobal),
	unique("matricula_protocolo_local_unique").on(table.protocoloLocal)
]);
const documento = pgTable("documento", {
	id: text().primaryKey().notNull(),
	matriculaId: text("matricula_id").notNull(),
	tipo: tipoDocumento().notNull(),
	status: statusDocumento().default("pendente").notNull(),
	arquivoUrl: text("arquivo_url"),
	nomeArquivo: text("nome_arquivo"),
	tamanhoArquivo: integer("tamanho_arquivo"),
	observacoes: text(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull()
}, (table) => [foreignKey({
	columns: [table.matriculaId],
	foreignColumns: [matricula.id],
	name: "documento_matricula_id_matricula_id_fk"
}).onDelete("cascade")]);
const turma = pgTable("turma", {
	id: text().primaryKey().notNull(),
	idGlobal: text("id_global"),
	etapa: etapa().notNull(),
	turno: turno().notNull(),
	capacidade: integer().notNull(),
	vagasDisponiveis: integer("vagas_disponiveis").notNull(),
	anoLetivo: text("ano_letivo").notNull(),
	nome: text().notNull(),
	ativa: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull()
}, (table) => [unique("turma_id_global_unique").on(table.idGlobal)]);
const contatoEmergencia = pgTable("contato_emergencia", {
	id: text().primaryKey().notNull(),
	matriculaId: text("matricula_id").notNull(),
	nome: text().notNull(),
	telefone: text().notNull(),
	parentesco: text().notNull(),
	observacoes: text(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull()
}, (table) => [foreignKey({
	columns: [table.matriculaId],
	foreignColumns: [matricula.id],
	name: "contato_emergencia_matricula_id_matricula_id_fk"
}).onDelete("cascade")]);
const responsavel = pgTable("responsavel", {
	id: text().primaryKey().notNull(),
	idGlobal: text("id_global"),
	nome: text().notNull(),
	cpf: text().notNull(),
	telefone: text().notNull(),
	endereco: text().notNull(),
	bairro: text().notNull(),
	email: text(),
	parentesco: text().default("pai").notNull(),
	autorizadoRetirada: boolean("autorizado_retirada").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	rg: text(),
	dataNascimento: timestamp("data_nascimento", { mode: "string" }),
	naturalidade: text(),
	nacionalidade: text(),
	sexo: text(),
	estadoCivil: text("estado_civil"),
	profissao: text(),
	localTrabalho: text("local_trabalho"),
	telefoneTrabalho: text("telefone_trabalho"),
	contatoEmergencia: text("contato_emergencia"),
	telefoneEmergencia: text("telefone_emergencia"),
	parentescoEmergencia: text("parentesco_emergencia")
}, (table) => [unique("responsavel_id_global_unique").on(table.idGlobal), unique("responsavel_cpf_unique").on(table.cpf)]);

//#endregion
export { account, aluno, contatoEmergencia, documento, etapa, formatoRelatorio, matricula, pendencia, relatorioGerado, responsavel, session, statusDocumento, statusMatricula, tipoDocumento, tipoRelatorio, turma, turno, user, verification };
//# sourceMappingURL=schema-Dma5Noty.js.map
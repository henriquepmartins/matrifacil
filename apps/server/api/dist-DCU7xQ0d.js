//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
let drizzle_orm_pg_core = require("drizzle-orm/pg-core");
drizzle_orm_pg_core = __toESM(drizzle_orm_pg_core);
let drizzle_orm_node_postgres = require("drizzle-orm/node-postgres");
drizzle_orm_node_postgres = __toESM(drizzle_orm_node_postgres);
let pg = require("pg");
pg = __toESM(pg);

//#region ../../packages/db/dist/auth-Cw4JLggD.js
const user = (0, drizzle_orm_pg_core.pgTable)("user", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	name: (0, drizzle_orm_pg_core.text)("name").notNull(),
	email: (0, drizzle_orm_pg_core.text)("email").notNull().unique(),
	emailVerified: (0, drizzle_orm_pg_core.boolean)("emailVerified").notNull().default(false),
	image: (0, drizzle_orm_pg_core.text)("image"),
	role: (0, drizzle_orm_pg_core.text)("role").notNull().default("RECEPCAO").$type(),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("createdAt").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updatedAt").notNull().defaultNow()
});
const session = (0, drizzle_orm_pg_core.pgTable)("session", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	expiresAt: (0, drizzle_orm_pg_core.timestamp)("expiresAt").notNull(),
	token: (0, drizzle_orm_pg_core.text)("token").notNull().unique(),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("createdAt").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updatedAt").notNull().defaultNow(),
	ipAddress: (0, drizzle_orm_pg_core.text)("ipAddress"),
	userAgent: (0, drizzle_orm_pg_core.text)("userAgent"),
	userId: (0, drizzle_orm_pg_core.text)("userId").notNull().references(() => user.id, { onDelete: "cascade" })
});
const account = (0, drizzle_orm_pg_core.pgTable)("account", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	accountId: (0, drizzle_orm_pg_core.text)("accountId").notNull(),
	providerId: (0, drizzle_orm_pg_core.text)("providerId").notNull(),
	userId: (0, drizzle_orm_pg_core.text)("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
	accessToken: (0, drizzle_orm_pg_core.text)("accessToken"),
	refreshToken: (0, drizzle_orm_pg_core.text)("refreshToken"),
	idToken: (0, drizzle_orm_pg_core.text)("idToken"),
	accessTokenExpiresAt: (0, drizzle_orm_pg_core.timestamp)("accessTokenExpiresAt"),
	refreshTokenExpiresAt: (0, drizzle_orm_pg_core.timestamp)("refreshTokenExpiresAt"),
	scope: (0, drizzle_orm_pg_core.text)("scope"),
	password: (0, drizzle_orm_pg_core.text)("password"),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("createdAt").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updatedAt").notNull().defaultNow()
});
const verification = (0, drizzle_orm_pg_core.pgTable)("verification", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	identifier: (0, drizzle_orm_pg_core.text)("identifier").notNull(),
	value: (0, drizzle_orm_pg_core.text)("value").notNull(),
	expiresAt: (0, drizzle_orm_pg_core.timestamp)("expiresAt").notNull(),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("createdAt").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updatedAt").notNull().defaultNow()
});

//#endregion
//#region ../../packages/db/dist/matriculas-CUN1skwu.js
const statusMatriculaEnum = (0, drizzle_orm_pg_core.pgEnum)("status_matricula", [
	"pre",
	"pendente_doc",
	"completo",
	"concluido"
]);
const tipoDocumentoEnum = (0, drizzle_orm_pg_core.pgEnum)("tipo_documento", [
	"certidao",
	"rg_cpf_resp",
	"vacina",
	"residencia",
	"historico",
	"foto3x4"
]);
const statusDocumentoEnum = (0, drizzle_orm_pg_core.pgEnum)("status_documento", [
	"pendente",
	"anexado",
	"aprovado"
]);
const etapaEnum = (0, drizzle_orm_pg_core.pgEnum)("etapa", [
	"bercario",
	"maternal",
	"pre_escola",
	"fundamental"
]);
const turnoEnum = (0, drizzle_orm_pg_core.pgEnum)("turno", [
	"manha",
	"tarde",
	"integral"
]);
const aluno = (0, drizzle_orm_pg_core.pgTable)("aluno", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	idGlobal: (0, drizzle_orm_pg_core.text)("id_global").unique(),
	nome: (0, drizzle_orm_pg_core.text)("nome").notNull(),
	dataNascimento: (0, drizzle_orm_pg_core.timestamp)("data_nascimento").notNull(),
	etapa: etapaEnum("etapa").notNull(),
	status: statusMatriculaEnum("status").notNull().default("pre"),
	necessidadesEspeciais: (0, drizzle_orm_pg_core.boolean)("necessidades_especiais").notNull().default(false),
	observacoes: (0, drizzle_orm_pg_core.text)("observacoes"),
	rg: (0, drizzle_orm_pg_core.text)("rg"),
	cpf: (0, drizzle_orm_pg_core.text)("cpf"),
	naturalidade: (0, drizzle_orm_pg_core.text)("naturalidade"),
	nacionalidade: (0, drizzle_orm_pg_core.text)("nacionalidade"),
	sexo: (0, drizzle_orm_pg_core.text)("sexo"),
	corRaca: (0, drizzle_orm_pg_core.text)("cor_raca"),
	tipoSanguineo: (0, drizzle_orm_pg_core.text)("tipo_sanguineo"),
	alergias: (0, drizzle_orm_pg_core.text)("alergias"),
	medicamentos: (0, drizzle_orm_pg_core.text)("medicamentos"),
	doencas: (0, drizzle_orm_pg_core.text)("doencas"),
	carteiraVacina: (0, drizzle_orm_pg_core.boolean)("carteira_vacina").default(false),
	observacoesSaude: (0, drizzle_orm_pg_core.text)("observacoes_saude"),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at").notNull().defaultNow()
});
const responsavel = (0, drizzle_orm_pg_core.pgTable)("responsavel", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	idGlobal: (0, drizzle_orm_pg_core.text)("id_global").unique(),
	nome: (0, drizzle_orm_pg_core.text)("nome").notNull(),
	cpf: (0, drizzle_orm_pg_core.text)("cpf").notNull().unique(),
	telefone: (0, drizzle_orm_pg_core.text)("telefone").notNull(),
	endereco: (0, drizzle_orm_pg_core.text)("endereco").notNull(),
	bairro: (0, drizzle_orm_pg_core.text)("bairro").notNull(),
	email: (0, drizzle_orm_pg_core.text)("email"),
	parentesco: (0, drizzle_orm_pg_core.text)("parentesco").notNull().default("pai"),
	autorizadoRetirada: (0, drizzle_orm_pg_core.boolean)("autorizado_retirada").notNull().default(true),
	rg: (0, drizzle_orm_pg_core.text)("rg"),
	dataNascimento: (0, drizzle_orm_pg_core.timestamp)("data_nascimento"),
	naturalidade: (0, drizzle_orm_pg_core.text)("naturalidade"),
	nacionalidade: (0, drizzle_orm_pg_core.text)("nacionalidade"),
	sexo: (0, drizzle_orm_pg_core.text)("sexo"),
	estadoCivil: (0, drizzle_orm_pg_core.text)("estado_civil"),
	profissao: (0, drizzle_orm_pg_core.text)("profissao"),
	localTrabalho: (0, drizzle_orm_pg_core.text)("local_trabalho"),
	telefoneTrabalho: (0, drizzle_orm_pg_core.text)("telefone_trabalho"),
	contatoEmergencia: (0, drizzle_orm_pg_core.text)("contato_emergencia"),
	telefoneEmergencia: (0, drizzle_orm_pg_core.text)("telefone_emergencia"),
	parentescoEmergencia: (0, drizzle_orm_pg_core.text)("parentesco_emergencia"),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at").notNull().defaultNow()
});
const turma = (0, drizzle_orm_pg_core.pgTable)("turma", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	idGlobal: (0, drizzle_orm_pg_core.text)("id_global").unique(),
	etapa: etapaEnum("etapa").notNull(),
	turno: turnoEnum("turno").notNull(),
	capacidade: (0, drizzle_orm_pg_core.integer)("capacidade").notNull(),
	vagasDisponiveis: (0, drizzle_orm_pg_core.integer)("vagas_disponiveis").notNull(),
	anoLetivo: (0, drizzle_orm_pg_core.text)("ano_letivo").notNull(),
	nome: (0, drizzle_orm_pg_core.text)("nome").notNull(),
	ativa: (0, drizzle_orm_pg_core.boolean)("ativa").notNull().default(true),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at").notNull().defaultNow()
});
const matricula = (0, drizzle_orm_pg_core.pgTable)("matricula", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	idGlobal: (0, drizzle_orm_pg_core.text)("id_global").unique(),
	protocoloLocal: (0, drizzle_orm_pg_core.text)("protocolo_local").notNull().unique(),
	alunoId: (0, drizzle_orm_pg_core.text)("aluno_id").notNull().references(() => aluno.id, { onDelete: "cascade" }),
	responsavelId: (0, drizzle_orm_pg_core.text)("responsavel_id").notNull().references(() => responsavel.id, { onDelete: "cascade" }),
	turmaId: (0, drizzle_orm_pg_core.text)("turma_id").references(() => turma.id, { onDelete: "set null" }),
	status: statusMatriculaEnum("status").notNull().default("pre"),
	dataMatricula: (0, drizzle_orm_pg_core.timestamp)("data_matricula"),
	observacoes: (0, drizzle_orm_pg_core.text)("observacoes"),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at").notNull().defaultNow()
});
const documento = (0, drizzle_orm_pg_core.pgTable)("documento", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	matriculaId: (0, drizzle_orm_pg_core.text)("matricula_id").notNull().references(() => matricula.id, { onDelete: "cascade" }),
	tipo: tipoDocumentoEnum("tipo").notNull(),
	status: statusDocumentoEnum("status").notNull().default("pendente"),
	arquivoUrl: (0, drizzle_orm_pg_core.text)("arquivo_url"),
	nomeArquivo: (0, drizzle_orm_pg_core.text)("nome_arquivo"),
	tamanhoArquivo: (0, drizzle_orm_pg_core.integer)("tamanho_arquivo"),
	observacoes: (0, drizzle_orm_pg_core.text)("observacoes"),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at").notNull().defaultNow()
});
const contatoEmergencia = (0, drizzle_orm_pg_core.pgTable)("contato_emergencia", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	matriculaId: (0, drizzle_orm_pg_core.text)("matricula_id").notNull().references(() => matricula.id, { onDelete: "cascade" }),
	nome: (0, drizzle_orm_pg_core.text)("nome").notNull(),
	telefone: (0, drizzle_orm_pg_core.text)("telefone").notNull(),
	parentesco: (0, drizzle_orm_pg_core.text)("parentesco").notNull(),
	observacoes: (0, drizzle_orm_pg_core.text)("observacoes"),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at").notNull().defaultNow()
});
const pendencia = (0, drizzle_orm_pg_core.pgTable)("pendencia", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	matriculaId: (0, drizzle_orm_pg_core.text)("matricula_id").notNull().references(() => matricula.id, { onDelete: "cascade" }),
	documentoId: (0, drizzle_orm_pg_core.text)("documento_id").references(() => documento.id, { onDelete: "set null" }),
	descricao: (0, drizzle_orm_pg_core.text)("descricao").notNull(),
	prazo: (0, drizzle_orm_pg_core.timestamp)("prazo"),
	resolvido: (0, drizzle_orm_pg_core.boolean)("resolvido").notNull().default(false),
	dataResolucao: (0, drizzle_orm_pg_core.timestamp)("data_resolucao"),
	observacoes: (0, drizzle_orm_pg_core.text)("observacoes"),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at").notNull().defaultNow(),
	updatedAt: (0, drizzle_orm_pg_core.timestamp)("updated_at").notNull().defaultNow()
});

//#endregion
//#region ../../packages/db/dist/relatorios-MA4w_T5v.js
const tipoRelatorioEnum = (0, drizzle_orm_pg_core.pgEnum)("tipo_relatorio", [
	"matriculas",
	"pre_matriculas",
	"turmas",
	"documentos",
	"pendencias",
	"geral"
]);
const formatoRelatorioEnum = (0, drizzle_orm_pg_core.pgEnum)("formato_relatorio", ["pdf", "csv"]);
const relatorioGerado = (0, drizzle_orm_pg_core.pgTable)("relatorio_gerado", {
	id: (0, drizzle_orm_pg_core.text)("id").primaryKey(),
	tipo: tipoRelatorioEnum("tipo").notNull(),
	formato: formatoRelatorioEnum("formato").notNull(),
	filtros: (0, drizzle_orm_pg_core.jsonb)("filtros").notNull(),
	usuarioId: (0, drizzle_orm_pg_core.text)("usuario_id").notNull(),
	nomeArquivo: (0, drizzle_orm_pg_core.text)("nome_arquivo").notNull(),
	tamanhoArquivo: (0, drizzle_orm_pg_core.text)("tamanho_arquivo"),
	createdAt: (0, drizzle_orm_pg_core.timestamp)("created_at").notNull().defaultNow()
});

//#endregion
//#region ../../packages/db/dist/index.js
if (!process.env.DATABASE_URL) throw new Error("❌ DATABASE_URL is not defined!\n\nPlease create the file 'apps/web/.env' with your Supabase connection string.\nSee ENV_SETUP.md for instructions.");
const db = (0, drizzle_orm_node_postgres.drizzle)(new pg.Pool({ connectionString: process.env.DATABASE_URL }));

//#endregion
Object.defineProperty(exports, '__commonJS', {
  enumerable: true,
  get: function () {
    return __commonJS;
  }
});
Object.defineProperty(exports, '__toESM', {
  enumerable: true,
  get: function () {
    return __toESM;
  }
});
Object.defineProperty(exports, 'account', {
  enumerable: true,
  get: function () {
    return account;
  }
});
Object.defineProperty(exports, 'aluno', {
  enumerable: true,
  get: function () {
    return aluno;
  }
});
Object.defineProperty(exports, 'db', {
  enumerable: true,
  get: function () {
    return db;
  }
});
Object.defineProperty(exports, 'documento', {
  enumerable: true,
  get: function () {
    return documento;
  }
});
Object.defineProperty(exports, 'etapaEnum', {
  enumerable: true,
  get: function () {
    return etapaEnum;
  }
});
Object.defineProperty(exports, 'formatoRelatorioEnum', {
  enumerable: true,
  get: function () {
    return formatoRelatorioEnum;
  }
});
Object.defineProperty(exports, 'matricula', {
  enumerable: true,
  get: function () {
    return matricula;
  }
});
Object.defineProperty(exports, 'pendencia', {
  enumerable: true,
  get: function () {
    return pendencia;
  }
});
Object.defineProperty(exports, 'relatorioGerado', {
  enumerable: true,
  get: function () {
    return relatorioGerado;
  }
});
Object.defineProperty(exports, 'responsavel', {
  enumerable: true,
  get: function () {
    return responsavel;
  }
});
Object.defineProperty(exports, 'session', {
  enumerable: true,
  get: function () {
    return session;
  }
});
Object.defineProperty(exports, 'statusDocumentoEnum', {
  enumerable: true,
  get: function () {
    return statusDocumentoEnum;
  }
});
Object.defineProperty(exports, 'statusMatriculaEnum', {
  enumerable: true,
  get: function () {
    return statusMatriculaEnum;
  }
});
Object.defineProperty(exports, 'tipoDocumentoEnum', {
  enumerable: true,
  get: function () {
    return tipoDocumentoEnum;
  }
});
Object.defineProperty(exports, 'tipoRelatorioEnum', {
  enumerable: true,
  get: function () {
    return tipoRelatorioEnum;
  }
});
Object.defineProperty(exports, 'turma', {
  enumerable: true,
  get: function () {
    return turma;
  }
});
Object.defineProperty(exports, 'turnoEnum', {
  enumerable: true,
  get: function () {
    return turnoEnum;
  }
});
Object.defineProperty(exports, 'user', {
  enumerable: true,
  get: function () {
    return user;
  }
});
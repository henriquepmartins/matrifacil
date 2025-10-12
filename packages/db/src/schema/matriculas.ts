import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const statusMatriculaEnum = pgEnum("status_matricula", [
  "pre",
  "pendente_doc",
  "completo",
  "concluido",
]);
export const tipoDocumentoEnum = pgEnum("tipo_documento", [
  "certidao",
  "rg_cpf_resp",
  "vacina",
  "residencia",
  "historico",
  "foto3x4",
]);
export const statusDocumentoEnum = pgEnum("status_documento", [
  "pendente",
  "anexado",
  "aprovado",
]);
export const etapaEnum = pgEnum("etapa", [
  "bercario",
  "maternal",
  "pre_escola",
  "fundamental",
]);
export const turnoEnum = pgEnum("turno", ["manha", "tarde", "integral"]);

// Tabela de Alunos
export const aluno = pgTable("aluno", {
  id: text("id").primaryKey(),
  idGlobal: text("id_global").unique(),
  nome: text("nome").notNull(),
  dataNascimento: timestamp("data_nascimento").notNull(),
  etapa: etapaEnum("etapa").notNull(),
  status: statusMatriculaEnum("status").notNull().default("pre"),
  necessidadesEspeciais: boolean("necessidades_especiais")
    .notNull()
    .default(false),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de Responsáveis
export const responsavel = pgTable("responsavel", {
  id: text("id").primaryKey(),
  idGlobal: text("id_global").unique(),
  nome: text("nome").notNull(),
  cpf: text("cpf").notNull().unique(),
  telefone: text("telefone").notNull(),
  endereco: text("endereco").notNull(),
  bairro: text("bairro").notNull(),
  email: text("email"),
  parentesco: text("parentesco").notNull().default("pai"),
  autorizadoRetirada: boolean("autorizado_retirada").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de Turmas
export const turma = pgTable("turma", {
  id: text("id").primaryKey(),
  idGlobal: text("id_global").unique(),
  etapa: etapaEnum("etapa").notNull(),
  turno: turnoEnum("turno").notNull(),
  capacidade: integer("capacidade").notNull(),
  vagasDisponiveis: integer("vagas_disponiveis").notNull(),
  anoLetivo: text("ano_letivo").notNull(),
  nome: text("nome").notNull(),
  ativa: boolean("ativa").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de Matrículas
export const matricula = pgTable("matricula", {
  id: text("id").primaryKey(),
  idGlobal: text("id_global").unique(),
  protocoloLocal: text("protocolo_local").notNull().unique(),
  alunoId: text("aluno_id")
    .notNull()
    .references(() => aluno.id, { onDelete: "cascade" }),
  responsavelId: text("responsavel_id")
    .notNull()
    .references(() => responsavel.id, { onDelete: "cascade" }),
  turmaId: text("turma_id").references(() => turma.id, {
    onDelete: "set null",
  }),
  status: statusMatriculaEnum("status").notNull().default("pre"),
  dataMatricula: timestamp("data_matricula"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de Documentos
export const documento = pgTable("documento", {
  id: text("id").primaryKey(),
  matriculaId: text("matricula_id")
    .notNull()
    .references(() => matricula.id, { onDelete: "cascade" }),
  tipo: tipoDocumentoEnum("tipo").notNull(),
  status: statusDocumentoEnum("status").notNull().default("pendente"),
  arquivoUrl: text("arquivo_url"),
  nomeArquivo: text("nome_arquivo"),
  tamanhoArquivo: integer("tamanho_arquivo"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de Pendências
export const pendencia = pgTable("pendencia", {
  id: text("id").primaryKey(),
  matriculaId: text("matricula_id")
    .notNull()
    .references(() => matricula.id, { onDelete: "cascade" }),
  documentoId: text("documento_id").references(() => documento.id, {
    onDelete: "set null",
  }),
  descricao: text("descricao").notNull(),
  prazo: timestamp("prazo"),
  resolvido: boolean("resolvido").notNull().default(false),
  dataResolucao: timestamp("data_resolucao"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

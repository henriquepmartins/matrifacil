CREATE TYPE "public"."etapa" AS ENUM('bercario', 'maternal', 'pre_escola', 'fundamental');--> statement-breakpoint
CREATE TYPE "public"."status_documento" AS ENUM('pendente', 'anexado', 'aprovado');--> statement-breakpoint
CREATE TYPE "public"."status_matricula" AS ENUM('pre', 'pendente_doc', 'completo', 'concluido');--> statement-breakpoint
CREATE TYPE "public"."tipo_documento" AS ENUM('certidao', 'rg_cpf_resp', 'vacina', 'residencia', 'historico', 'foto3x4');--> statement-breakpoint
CREATE TYPE "public"."turno" AS ENUM('manha', 'tarde', 'integral');--> statement-breakpoint
CREATE TABLE "aluno" (
	"id" text PRIMARY KEY NOT NULL,
	"id_global" text,
	"nome" text NOT NULL,
	"data_nascimento" timestamp NOT NULL,
	"etapa" "etapa" NOT NULL,
	"status" "status_matricula" DEFAULT 'pre' NOT NULL,
	"necessidades_especiais" boolean DEFAULT false NOT NULL,
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "aluno_id_global_unique" UNIQUE("id_global")
);
--> statement-breakpoint
CREATE TABLE "documento" (
	"id" text PRIMARY KEY NOT NULL,
	"matricula_id" text NOT NULL,
	"tipo" "tipo_documento" NOT NULL,
	"status" "status_documento" DEFAULT 'pendente' NOT NULL,
	"arquivo_url" text,
	"nome_arquivo" text,
	"tamanho_arquivo" integer,
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matricula" (
	"id" text PRIMARY KEY NOT NULL,
	"id_global" text,
	"protocolo_local" text NOT NULL,
	"aluno_id" text NOT NULL,
	"responsavel_id" text NOT NULL,
	"turma_id" text,
	"status" "status_matricula" DEFAULT 'pre' NOT NULL,
	"data_matricula" timestamp,
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "matricula_id_global_unique" UNIQUE("id_global"),
	CONSTRAINT "matricula_protocolo_local_unique" UNIQUE("protocolo_local")
);
--> statement-breakpoint
CREATE TABLE "pendencia" (
	"id" text PRIMARY KEY NOT NULL,
	"matricula_id" text NOT NULL,
	"documento_id" text,
	"descricao" text NOT NULL,
	"prazo" timestamp,
	"resolvido" boolean DEFAULT false NOT NULL,
	"data_resolucao" timestamp,
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responsavel" (
	"id" text PRIMARY KEY NOT NULL,
	"id_global" text,
	"nome" text NOT NULL,
	"cpf" text NOT NULL,
	"telefone" text NOT NULL,
	"endereco" text NOT NULL,
	"bairro" text NOT NULL,
	"email" text,
	"parentesco" text DEFAULT 'pai' NOT NULL,
	"autorizado_retirada" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "responsavel_id_global_unique" UNIQUE("id_global"),
	CONSTRAINT "responsavel_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "turma" (
	"id" text PRIMARY KEY NOT NULL,
	"id_global" text,
	"etapa" "etapa" NOT NULL,
	"turno" "turno" NOT NULL,
	"capacidade" integer NOT NULL,
	"vagas_disponiveis" integer NOT NULL,
	"ano_letivo" text NOT NULL,
	"nome" text NOT NULL,
	"ativa" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "turma_id_global_unique" UNIQUE("id_global")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'RECEPCAO' NOT NULL;--> statement-breakpoint
ALTER TABLE "documento" ADD CONSTRAINT "documento_matricula_id_matricula_id_fk" FOREIGN KEY ("matricula_id") REFERENCES "public"."matricula"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matricula" ADD CONSTRAINT "matricula_aluno_id_aluno_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."aluno"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matricula" ADD CONSTRAINT "matricula_responsavel_id_responsavel_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."responsavel"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matricula" ADD CONSTRAINT "matricula_turma_id_turma_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turma"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pendencia" ADD CONSTRAINT "pendencia_matricula_id_matricula_id_fk" FOREIGN KEY ("matricula_id") REFERENCES "public"."matricula"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pendencia" ADD CONSTRAINT "pendencia_documento_id_documento_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."documento"("id") ON DELETE set null ON UPDATE no action;
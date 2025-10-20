CREATE TABLE "contato_emergencia" (
	"id" text PRIMARY KEY NOT NULL,
	"matricula_id" text NOT NULL,
	"nome" text NOT NULL,
	"telefone" text NOT NULL,
	"parentesco" text NOT NULL,
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "rg" text;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "cpf" text;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "naturalidade" text;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "nacionalidade" text DEFAULT 'Brasileira';--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "sexo" text;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "cor_raca" text;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "tipo_sanguineo" text;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "alergias" text;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "medicamentos" text;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "doencas" text;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "carteira_vacina" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "aluno" ADD COLUMN "observacoes_saude" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "rg" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "data_nascimento" timestamp;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "naturalidade" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "nacionalidade" text DEFAULT 'Brasileira';--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "sexo" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "estado_civil" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "profissao" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "local_trabalho" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "telefone_trabalho" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "contato_emergencia" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "telefone_emergencia" text;--> statement-breakpoint
ALTER TABLE "responsavel" ADD COLUMN "parentesco_emergencia" text;--> statement-breakpoint
ALTER TABLE "contato_emergencia" ADD CONSTRAINT "contato_emergencia_matricula_id_matricula_id_fk" FOREIGN KEY ("matricula_id") REFERENCES "public"."matricula"("id") ON DELETE cascade ON UPDATE no action;
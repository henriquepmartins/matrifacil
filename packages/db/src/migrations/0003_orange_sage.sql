CREATE TYPE "public"."formato_relatorio" AS ENUM('pdf', 'csv');--> statement-breakpoint
CREATE TYPE "public"."tipo_relatorio" AS ENUM('matriculas', 'pre_matriculas', 'turmas', 'documentos', 'pendencias', 'geral');--> statement-breakpoint
CREATE TABLE "relatorio_gerado" (
	"id" text PRIMARY KEY NOT NULL,
	"tipo" "tipo_relatorio" NOT NULL,
	"formato" "formato_relatorio" NOT NULL,
	"filtros" jsonb NOT NULL,
	"usuario_id" text NOT NULL,
	"nome_arquivo" text NOT NULL,
	"tamanho_arquivo" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

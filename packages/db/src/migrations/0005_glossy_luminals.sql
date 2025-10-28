CREATE TYPE "public"."sync_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "sync_conflict" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"entity" text NOT NULL,
	"local_id" text NOT NULL,
	"global_id" text NOT NULL,
	"local_data" jsonb NOT NULL,
	"server_data" jsonb NOT NULL,
	"resolved" boolean DEFAULT false NOT NULL,
	"resolved_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"device_id" text,
	"batch_id" text NOT NULL,
	"status" "sync_status" DEFAULT 'pending' NOT NULL,
	"records_count" integer NOT NULL,
	"success_count" integer DEFAULT 0,
	"failure_count" integer DEFAULT 0,
	"error" text,
	"metadata" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create sync_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "public"."sync_status" AS ENUM('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Create sync_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS "sync_log" (
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
--> statement-breakpoint

-- Drop old sync_conflict table if it exists (with old schema)
DROP TABLE IF EXISTS "sync_conflict";
--> statement-breakpoint

-- Create sync_conflict table with correct schema
CREATE TABLE "sync_conflict" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"entity" text NOT NULL,
	"local_id" text NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create index on batch_id for better performance
CREATE INDEX IF NOT EXISTS "sync_conflict_batch_id_idx" ON "sync_conflict" ("batch_id");
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "sync_log_batch_id_idx" ON "sync_log" ("batch_id");


import {
  pgTable,
  text,
  timestamp,
  integer,
  pgEnum,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";

export const syncStatusEnum = pgEnum("sync_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const syncLog = pgTable("sync_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  deviceId: text("device_id"),
  batchId: text("batch_id").notNull(),
  status: syncStatusEnum("status").notNull().default("pending"),
  recordsCount: integer("records_count").notNull(),
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  error: text("error"),
  metadata: jsonb("metadata"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const syncConflict = pgTable("sync_conflict", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  entity: text("entity").notNull(),
  idLocal: text("local_id").notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

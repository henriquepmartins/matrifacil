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
  userId: text("user_id").notNull(),
  entity: text("entity").notNull(),
  localId: text("local_id").notNull(),
  globalId: text("global_id").notNull(),
  localData: jsonb("local_data").notNull(),
  serverData: jsonb("server_data").notNull(),
  resolved: boolean("resolved").notNull().default(false),
  resolvedData: jsonb("resolved_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

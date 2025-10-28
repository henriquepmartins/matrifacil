import { Queue, QueueEvents } from "bullmq";
import { getRedisClient } from "./redis.config.js";

export enum SyncQueueType {
  BATCH_SYNC = "batch-sync",
  STORAGE_UPLOAD = "storage-upload",
}

let syncQueue: Queue | null = null;
let syncQueueEvents: QueueEvents | null = null;
let storageQueue: Queue | null = null;
let storageQueueEvents: QueueEvents | null = null;

export function getSyncQueue(): Queue | null {
  const redis = getRedisClient();

  if (!redis) {
    console.warn("⚠️ Redis não disponível - filas desabilitadas");
    return null;
  }

  if (!syncQueue) {
    syncQueue = new Queue(SyncQueueType.BATCH_SYNC, {
      connection: redis as any,
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });
  }

  return syncQueue;
}

export function getSyncQueueEvents(): QueueEvents | null {
  const redis = getRedisClient();

  if (!redis || syncQueueEvents) {
    return syncQueueEvents;
  }

  syncQueueEvents = new QueueEvents(SyncQueueType.BATCH_SYNC, {
    connection: redis as any,
  });

  return syncQueueEvents;
}

export function getStorageQueue(): Queue | null {
  const redis = getRedisClient();

  if (!redis) {
    console.warn("⚠️ Redis não disponível - filas desabilitadas");
    return null;
  }

  if (!storageQueue) {
    storageQueue = new Queue(SyncQueueType.STORAGE_UPLOAD, {
      connection: redis as any,
      defaultJobOptions: {
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 100 },
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 3000,
        },
      },
    });
  }

  return storageQueue;
}

export function getStorageQueueEvents(): QueueEvents | null {
  const redis = getRedisClient();

  if (!redis || storageQueueEvents) {
    return storageQueueEvents;
  }

  storageQueueEvents = new QueueEvents(SyncQueueType.STORAGE_UPLOAD, {
    connection: redis as any,
  });

  return storageQueueEvents;
}

export async function closeQueues(): Promise<void> {
  await Promise.all([
    syncQueue?.close(),
    syncQueueEvents?.close(),
    storageQueue?.close(),
    storageQueueEvents?.close(),
  ]);

  syncQueue = null;
  syncQueueEvents = null;
  storageQueue = null;
  storageQueueEvents = null;
}

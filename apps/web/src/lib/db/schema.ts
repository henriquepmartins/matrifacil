import Dexie, { Table } from "dexie";

/**
 * Interface para usuários no cache local
 */
export interface CachedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para sessões no cache local
 */
export interface CachedSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Interface para fila de sincronização
 * Armazena operações pendentes quando offline
 */
export interface SyncQueueItem {
  id?: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  table: string;
  data: any;
  timestamp: Date;
  synced: boolean;
  error?: string;
  retries: number;
}

/**
 * Interface para metadados de sincronização
 */
export interface SyncMetadata {
  key: string;
  value: any;
  updatedAt: Date;
}

/**
 * Banco de dados IndexedDB com Dexie
 */
export class MatriFacilDB extends Dexie {
  users!: Table<CachedUser, string>;
  sessions!: Table<CachedSession, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  syncMetadata!: Table<SyncMetadata, string>;

  constructor() {
    super("MatriFacilDB");

    this.version(1).stores({
      users: "id, email, updatedAt",
      sessions: "id, userId, expiresAt",
      syncQueue: "++id, synced, timestamp",
      syncMetadata: "key, updatedAt",
    });
  }
}

// Instância singleton do banco de dados
export const db = new MatriFacilDB();

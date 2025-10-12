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
  role: "ADMIN" | "COORDENACAO" | "RECEPCAO";
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
 * Interface para alunos no cache local
 */
export interface CachedAluno {
  id: string;
  idGlobal?: string;
  nome: string;
  dataNascimento: Date;
  etapa: "bercario" | "maternal" | "pre_escola" | "fundamental";
  status: "pre" | "pendente_doc" | "completo" | "concluido";
  necessidadesEspeciais: boolean;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para responsáveis no cache local
 */
export interface CachedResponsavel {
  id: string;
  idGlobal?: string;
  nome: string;
  cpf: string;
  telefone: string;
  endereco: string;
  bairro: string;
  email?: string;
  parentesco: string;
  autorizadoRetirada: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para turmas no cache local
 */
export interface CachedTurma {
  id: string;
  idGlobal?: string;
  etapa: "bercario" | "maternal" | "pre_escola" | "fundamental";
  turno: "manha" | "tarde" | "integral";
  capacidade: number;
  vagasDisponiveis: number;
  anoLetivo: string;
  nome: string;
  ativa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para matrículas no cache local
 */
export interface CachedMatricula {
  id: string;
  idGlobal?: string;
  protocoloLocal: string;
  alunoId: string;
  responsavelId: string;
  turmaId?: string;
  status: "pre" | "pendente_doc" | "completo" | "concluido";
  dataMatricula?: Date;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para documentos no cache local
 */
export interface CachedDocumento {
  id: string;
  matriculaId: string;
  tipo:
    | "certidao"
    | "rg_cpf_resp"
    | "vacina"
    | "residencia"
    | "historico"
    | "foto3x4";
  status: "pendente" | "anexado" | "aprovado";
  arquivoUrl?: string;
  nomeArquivo?: string;
  tamanhoArquivo?: number;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para pendências no cache local
 */
export interface CachedPendencia {
  id: string;
  matriculaId: string;
  documentoId?: string;
  descricao: string;
  prazo?: Date;
  resolvido: boolean;
  dataResolucao?: Date;
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
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
  alunos!: Table<CachedAluno, string>;
  responsaveis!: Table<CachedResponsavel, string>;
  turmas!: Table<CachedTurma, string>;
  matriculas!: Table<CachedMatricula, string>;
  documentos!: Table<CachedDocumento, string>;
  pendencias!: Table<CachedPendencia, string>;

  constructor() {
    super("MatriFacilDB");

    this.version(1).stores({
      users: "id, email, updatedAt",
      sessions: "id, userId, expiresAt",
      syncQueue: "++id, synced, timestamp",
      syncMetadata: "key, updatedAt",
    });

    this.version(2).stores({
      users: "id, email, updatedAt",
      sessions: "id, userId, expiresAt",
      syncQueue: "++id, synced, timestamp",
      syncMetadata: "key, updatedAt",
      alunos: "id, idGlobal, nome, dataNascimento, etapa, status, updatedAt",
      responsaveis: "id, idGlobal, cpf, nome, updatedAt",
      turmas: "id, idGlobal, etapa, turno, anoLetivo, ativa, updatedAt",
      matriculas:
        "id, idGlobal, protocoloLocal, alunoId, responsavelId, turmaId, status, updatedAt",
      documentos: "id, matriculaId, tipo, status, updatedAt",
      pendencias: "id, matriculaId, documentoId, resolvido, updatedAt",
    });
  }
}

// Instância singleton do banco de dados
export const db = new MatriFacilDB();

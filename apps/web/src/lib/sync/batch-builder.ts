import { db } from "../db/index";
import type {
  CachedResponsavel,
  CachedAluno,
  CachedTurma,
  CachedMatricula,
  CachedDocumento,
  CachedPendencia,
} from "../db/index";

export interface BatchItem {
  entity: string;
  operation: "create" | "update" | "delete";
  id_local: string;
  data: any;
}

/**
 * Constrói um lote de sincronização ordenado por dependências
 * Ordem: responsavel → aluno → turma → matricula → documento → pendencia
 */
export async function buildSyncBatch(): Promise<BatchItem[]> {
  const batch: BatchItem[] = [];

  // 1. Responsáveis pendentes
  const responsaveisPendentes = await db.responsaveis
    .where("sync_status")
    .equals("pending")
    .toArray();

  for (const responsavel of responsaveisPendentes) {
    batch.push({
      entity: "responsavel",
      operation: getOperation(responsavel),
      id_local: responsavel.id,
      data: sanitizeData(responsavel),
    });
  }

  // 2. Alunos pendentes
  const alunosPendentes = await db.alunos
    .where("sync_status")
    .equals("pending")
    .toArray();

  for (const aluno of alunosPendentes) {
    batch.push({
      entity: "aluno",
      operation: getOperation(aluno),
      id_local: aluno.id,
      data: sanitizeData(aluno),
    });
  }

  // 3. Turmas pendentes
  const turmasPendentes = await db.turmas
    .where("sync_status")
    .equals("pending")
    .toArray();

  for (const turma of turmasPendentes) {
    batch.push({
      entity: "turma",
      operation: getOperation(turma),
      id_local: turma.id,
      data: sanitizeData(turma),
    });
  }

  // 4. Matrículas pendentes
  const matriculasPendentes = await db.matriculas
    .where("sync_status")
    .equals("pending")
    .toArray();

  for (const matricula of matriculasPendentes) {
    batch.push({
      entity: "matricula",
      operation: getOperation(matricula),
      id_local: matricula.id,
      data: {
        ...sanitizeData(matricula),
        // Manter referências locais para resolver no backend
        alunoId: matricula.alunoId,
        responsavelId: matricula.responsavelId,
        turmaId: matricula.turmaId,
      },
    });
  }

  // 5. Documentos pendentes
  const documentosPendentes = await db.documentos
    .where("sync_status")
    .equals("pending")
    .toArray();

  for (const documento of documentosPendentes) {
    batch.push({
      entity: "documento",
      operation: getOperation(documento),
      id_local: documento.id,
      data: {
        ...sanitizeData(documento),
        matriculaId: documento.matriculaId,
      },
    });
  }

  // 6. Pendências pendentes
  const pendenciasPendentes = await db.pendencias
    .where("sync_status")
    .equals("pending")
    .toArray();

  for (const pendencia of pendenciasPendentes) {
    batch.push({
      entity: "pendencia",
      operation: getOperation(pendencia),
      id_local: pendencia.id,
      data: {
        ...sanitizeData(pendencia),
        matriculaId: pendencia.matriculaId,
        documentoId: pendencia.documentoId,
      },
    });
  }

  return batch;
}

/**
 * Determina a operação baseada na existência de id_global
 */
function getOperation(item: any): "create" | "update" | "delete" {
  if (item.operation) {
    return item.operation;
  }

  if (!item.idGlobal) {
    return "create";
  }

  return "update";
}

/**
 * Remove campos de controle antes de enviar
 */
function sanitizeData(item: any): any {
  const {
    id,
    idGlobal,
    sync_status,
    operation,
    last_modified,
    synced_at,
    ...sanitized
  } = item;

  return sanitized;
}

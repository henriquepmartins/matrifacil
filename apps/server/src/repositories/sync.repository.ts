import { db } from "../config/database.config.js";
import { syncLog, syncConflict } from "@matrifacil-/db/schema/sync.js";
import {
  aluno,
  responsavel,
  matricula,
  turma,
  documento,
  pendencia,
} from "@matrifacil-/db/schema/matriculas.js";
import { eq, and, gt, sql } from "drizzle-orm";

export interface SyncBatchItem {
  entity: string;
  operation: "create" | "update" | "delete";
  id_local: string;
  data: any;
}

export interface SyncResult {
  mappings: Array<{
    entity: string;
    id_local: string;
    id_global: string;
  }>;
  conflicts: Array<{
    entity: string;
    id_local: string;
    error: string;
  }>;
}

export class SyncRepository {
  async processBatch(
    batch: SyncBatchItem[],
    userId: string
  ): Promise<SyncResult> {
    console.log(
      `🔄 Processando batch com ${batch.length} itens para userId: ${userId}`
    );

    const mappings: Array<{
      entity: string;
      id_local: string;
      id_global: string;
    }> = [];
    const conflicts: Array<{
      entity: string;
      id_local: string;
      error: string;
    }> = [];

    // Processar em ordem de dependências
    for (const item of batch) {
      try {
        console.log(
          `📝 Processando ${item.entity} (operação: ${item.operation}, id_local: ${item.id_local})`
        );
        let id_global: string | undefined;

        switch (item.entity) {
          case "responsavel":
            if (item.operation === "create") {
              const [created] = await db
                .insert(responsavel)
                .values({
                  id: this.generateId(),
                  ...item.data,
                })
                .returning({ id: responsavel.id });
              id_global = created.id;
            }
            break;

          case "aluno":
            if (item.operation === "create") {
              const [created] = await db
                .insert(aluno)
                .values({
                  id: this.generateId(),
                  ...item.data,
                })
                .returning({ id: aluno.id });
              id_global = created.id;
            }
            break;

          case "turma":
            if (item.operation === "create") {
              const [created] = await db
                .insert(turma)
                .values({
                  id: this.generateId(),
                  ...item.data,
                })
                .returning({ id: turma.id });
              id_global = created.id;
            }
            break;

          case "matricula":
            if (item.operation === "create") {
              // Resolver referências locais para globais
              const id_aluno_global =
                mappings.find((m) => m.id_local === item.data.alunoId)
                  ?.id_global || item.data.alunoId;

              const id_responsavel_global =
                mappings.find((m) => m.id_local === item.data.responsavelId)
                  ?.id_global || item.data.responsavelId;

              const id_turma_global = item.data.turmaId
                ? mappings.find((m) => m.id_local === item.data.turmaId)
                    ?.id_global || item.data.turmaId
                : null;

              // Verificar se turma tem vagas disponíveis (se aplicável)
              if (id_turma_global) {
                const [turmaInfo] = await db
                  .select()
                  .from(turma)
                  .where(eq(turma.id, id_turma_global))
                  .limit(1);

                if (!turmaInfo || turmaInfo.vagasDisponiveis <= 0) {
                  // Matrícula vai para lista de espera
                  item.data.status = "pre";
                } else {
                  // Atualizar vagas disponíveis
                  await db
                    .update(turma)
                    .set({
                      vagasDisponiveis: sql`${turma.vagasDisponiveis} - 1`,
                      updatedAt: new Date(),
                    })
                    .where(eq(turma.id, id_turma_global));
                }
              }

              // Gerar protocolo definitivo
              const protocolo = this.generateProtocolo();

              const [created] = await db
                .insert(matricula)
                .values({
                  id: this.generateId(),
                  alunoId: id_aluno_global,
                  responsavelId: id_responsavel_global,
                  turmaId: id_turma_global,
                  protocoloLocal: protocolo,
                  ...item.data,
                })
                .returning({ id: matricula.id });
              id_global = created.id;
            }
            break;

          case "documento":
            if (item.operation === "create") {
              const id_matricula_global =
                mappings.find((m) => m.id_local === item.data.matriculaId)
                  ?.id_global || item.data.matriculaId;

              const [created] = await db
                .insert(documento)
                .values({
                  id: this.generateId(),
                  matriculaId: id_matricula_global,
                  ...item.data,
                })
                .returning({ id: documento.id });
              id_global = created.id;
            }
            break;

          case "pendencia":
            if (item.operation === "create") {
              const id_matricula_global =
                mappings.find((m) => m.id_local === item.data.matriculaId)
                  ?.id_global || item.data.matriculaId;

              const id_documento_global = item.data.documentoId
                ? mappings.find((m) => m.id_local === item.data.documentoId)
                    ?.id_global || item.data.documentoId
                : null;

              const [created] = await db
                .insert(pendencia)
                .values({
                  id: this.generateId(),
                  matriculaId: id_matricula_global,
                  documentoId: id_documento_global,
                  ...item.data,
                })
                .returning({ id: pendencia.id });
              id_global = created.id;
            }
            break;

          default:
            throw new Error(`Entidade não suportada: ${item.entity}`);
        }

        if (id_global) {
          console.log(
            `✅ ${item.entity} processado com sucesso (${item.id_local} → ${id_global})`
          );
          mappings.push({
            entity: item.entity,
            id_local: item.id_local,
            id_global,
          });
        }
      } catch (error: any) {
        console.error(`❌ Erro ao processar ${item.entity}:`, error);
        conflicts.push({
          entity: item.entity,
          id_local: item.id_local,
          error: error.message || "Erro desconhecido",
        });
      }
    }

    console.log(
      `🎉 Batch processado: ${mappings.length} sucessos, ${conflicts.length} falhas`
    );
    return { mappings, conflicts };
  }

  async createSyncLog(data: {
    id: string;
    userId: string;
    batchId: string;
    recordsCount: number;
  }) {
    await db.insert(syncLog).values({
      ...data,
      status: "processing",
      startedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateSyncLog(
    batchId: string,
    data: {
      status: "completed" | "failed";
      successCount?: number;
      failureCount?: number;
      error?: string;
    }
  ) {
    await db
      .update(syncLog)
      .set({
        ...data,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(syncLog.batchId, batchId));
  }

  async getChangesSince(timestamp: Date) {
    // Buscar registros modificados desde o timestamp
    // Implementar para cada entidade
    return {
      responsaveis: [],
      alunos: [],
      turmas: [],
      matriculas: [],
      documentos: [],
      pendencias: [],
    };
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  private generateProtocolo(): string {
    const ano = new Date().getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `MAT-${ano}-${timestamp}-${random}`;
  }
}

export const syncRepository = new SyncRepository();

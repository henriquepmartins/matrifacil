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

// Função auxiliar para executar com retry em caso de erro de conexão
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  entityName: string,
  maxRetries = 3,
  delayMs = 2000
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries} para ${entityName}...`);
      }
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Operation timeout")), 30000)
        ),
      ]);
      return result;
    } catch (error: any) {
      lastError = error;
      
      // Log detalhado do erro
      console.error(`❌ Erro na tentativa ${attempt + 1}/${maxRetries} para ${entityName}:`, {
        code: error?.code,
        causeCode: error?.cause?.code,
        message: error?.message,
        severity: error?.severity,
      });
      
      // Verificar se é erro de conexão que pode ser recuperado
      const isConnectionError =
        error?.code === "XX000" ||
        error?.cause?.code === "XX000" ||
        error?.severity === "FATAL" ||
        error?.message?.includes("db_termination") ||
        error?.message?.includes("connection terminated") ||
        error?.message?.includes("Connection terminated") ||
        error?.message?.includes("shutdown") ||
        (error?.cause && typeof error.cause === "object" && "code" in error.cause && error.cause.code === "XX000");
      
      if (isConnectionError && attempt < maxRetries - 1) {
        const waitTime = delayMs * (attempt + 1); // Backoff exponencial
        console.warn(
          `⚠️ Erro de conexão detectado ao processar ${entityName} (tentativa ${attempt + 1}/${maxRetries}), aguardando ${waitTime}ms antes de tentar novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Se não for erro de conexão ou já tentou todas as vezes, lança o erro
      throw error;
    }
  }
  throw lastError;
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
      let errorHandled = false; // Flag para indicar se o erro foi tratado
      
      try {
        console.log(
          `📝 Processando ${item.entity} (operação: ${item.operation}, id_local: ${item.id_local})`
        );
        let id_global: string | undefined;
        
        // Pequeno delay entre itens para evitar sobrecarga de conexões
        if (mappings.length > 0 || conflicts.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        switch (item.entity) {
          case "responsavel":
            if (item.operation === "create") {
              // Verificar se já existe um responsável com o mesmo CPF
              if (item.data.cpf) {
                const existing = await executeWithRetry(
                  () =>
                    db
                      .select({ id: responsavel.id })
                      .from(responsavel)
                      .where(eq(responsavel.cpf, item.data.cpf))
                      .limit(1),
                  `responsavel findByCPF ${item.data.cpf}`
                );

                if (existing.length > 0) {
                  console.log(
                    `ℹ️  Responsável com CPF ${item.data.cpf} já existe, usando ID existente: ${existing[0].id}`
                  );
                  id_global = existing[0].id;
                } else {
                  // Criar novo responsável
                  const now = new Date();
                  const payload = {
                    id: this.generateId(),
                    ...item.data,
                    createdAt: now,
                    updatedAt: now,
                  } as any;
                  const [created] = await executeWithRetry(
                    () =>
                      db
                        .insert(responsavel)
                        .values(payload)
                        .returning({ id: responsavel.id }),
                    `responsavel insert ${item.id_local}`
                  );
                  id_global = created.id;
                }
              } else {
                // Se não tem CPF, criar normalmente
                const now = new Date();
                const payload = {
                  id: this.generateId(),
                  ...item.data,
                  createdAt: now,
                  updatedAt: now,
                } as any;
                const [created] = await executeWithRetry(
                  () =>
                    db
                      .insert(responsavel)
                      .values(payload)
                      .returning({ id: responsavel.id }),
                  `responsavel insert ${item.id_local}`
                );
                id_global = created.id;
              }
            }
            break;

          case "aluno":
            if (item.operation === "create") {
              const now = new Date();
              const payload = {
                id: this.generateId(),
                ...item.data,
                // Normalizar possíveis strings de data
                dataNascimento: item.data?.dataNascimento
                  ? new Date(item.data.dataNascimento)
                  : null,
                createdAt: now,
                updatedAt: now,
              } as any;
              const [created] = await executeWithRetry(
                () => db.insert(aluno).values(payload).returning({ id: aluno.id }),
                `aluno ${item.id_local}`
              );
              id_global = created.id;
            }
            break;

          case "turma":
            if (item.operation === "create") {
              const [created] = await executeWithRetry(
                () =>
                  db
                    .insert(turma)
                    .values({
                      id: this.generateId(),
                      ...item.data,
                    })
                    .returning({ id: turma.id }),
                `turma ${item.id_local}`
              );
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
                const [turmaInfo] = await executeWithRetry(
                  () =>
                    db
                      .select()
                      .from(turma)
                      .where(eq(turma.id, id_turma_global))
                      .limit(1),
                  `turma select ${id_turma_global}`
                );

                if (!turmaInfo || turmaInfo.vagasDisponiveis <= 0) {
                  // Matrícula vai para lista de espera
                  item.data.status = "pre";
                } else {
                  // Atualizar vagas disponíveis
                  await executeWithRetry(
                    () =>
                      db
                        .update(turma)
                        .set({
                          vagasDisponiveis: sql`${turma.vagasDisponiveis} - 1`,
                          updatedAt: new Date(),
                        })
                        .where(eq(turma.id, id_turma_global)),
                    `turma update ${id_turma_global}`
                  );
                }
              }

              // Gerar protocolo definitivo
              const protocolo = await this.generateProtocolo(
                item.data.aluno?.etapa || "bercario"
              );

              // Remover campos que o servidor calcula para evitar override
              const {
                alunoId: _,
                responsavelId: __,
                turmaId: ___,
                status: originalStatus,
                protocoloLocal: ____protocolo,
                createdAt: ____c,
                updatedAt: ____u,
                ...restOfData
              } = item.data;

              const [created] = await executeWithRetry(
                () =>
                  db
                    .insert(matricula)
                    .values({
                      id: this.generateId(),
                      alunoId: id_aluno_global,
                      responsavelId: id_responsavel_global,
                      turmaId: id_turma_global,
                      ...restOfData,
                      protocoloLocal: protocolo,
                      // Respeitar status original ou ajustado pela lógica de vagas
                      status: originalStatus ?? "pre",
                    })
                    .returning({ id: matricula.id }),
                `matricula ${item.id_local}`
              );
              id_global = created.id;
            }
            break;

          case "documento":
            if (item.operation === "create") {
              const id_matricula_global =
                mappings.find((m) => m.id_local === item.data.matriculaId)
                  ?.id_global || item.data.matriculaId;

              const [created] = await executeWithRetry(
                () =>
                  db
                    .insert(documento)
                    .values({
                      id: this.generateId(),
                      matriculaId: id_matricula_global,
                      ...item.data,
                    })
                    .returning({ id: documento.id }),
                `documento ${item.id_local}`
              );
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

              const [created] = await executeWithRetry(
                () =>
                  db
                    .insert(pendencia)
                    .values({
                      id: this.generateId(),
                      matriculaId: id_matricula_global,
                      documentoId: id_documento_global,
                      ...item.data,
                    })
                    .returning({ id: pendencia.id }),
                `pendencia ${item.id_local}`
              );
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
        // Verificar se é erro de duplicação (CPF único, etc)
        const isDuplicateError =
          error?.cause?.code === "23505" ||
          error?.code === "23505" ||
          error?.message?.includes("duplicate key") ||
          error?.message?.includes("unique constraint");

        if (isDuplicateError && item.entity === "responsavel" && item.data.cpf) {
          // Tentar buscar o responsável existente por CPF
          try {
            console.log(
              `🔄 Erro de duplicação detectado para responsável com CPF ${item.data.cpf}, buscando existente...`
            );
            const existing = await executeWithRetry(
              () =>
                db
                  .select({ id: responsavel.id })
                  .from(responsavel)
                  .where(eq(responsavel.cpf, item.data.cpf))
                  .limit(1),
              `responsavel findByCPF after duplicate ${item.data.cpf}`
            );

            if (existing.length > 0) {
              console.log(
                `✅ Responsável existente encontrado: ${existing[0].id}, usando este ID`
              );
              mappings.push({
                entity: item.entity,
                id_local: item.id_local,
                id_global: existing[0].id,
              });
              // Não adicionar ao conflicts, já foi resolvido
              errorHandled = true; // Marcar que o erro foi tratado
            }
          } catch (lookupError) {
            console.error(
              `❌ Erro ao buscar responsável existente após duplicação:`,
              lookupError
            );
          }
        }

        // Só adicionar ao conflicts se o erro não foi tratado
        if (!errorHandled) {
          console.error(`❌ Erro ao processar ${item.entity}:`, error);
          const errorMessage = error.message || error.toString() || "Erro desconhecido";
          conflicts.push({
            entity: item.entity,
            id_local: item.id_local,
            error: errorMessage,
          });
        }
      }
    }

    console.log(
      `🎉 Batch processado: ${mappings.length} sucessos, ${conflicts.length} falhas`
    );
    return { mappings, conflicts };
  }

  async saveSyncConflicts(batchId: string, conflicts: Array<{ entity: string; id_local: string; error: string }>) {
    if (conflicts.length === 0) return;

    await db.insert(syncConflict).values(
      conflicts.map((c) => ({
        id: this.generateId(),
        batchId,
        entity: c.entity,
        idLocal: c.id_local,
        error: c.error,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
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

  async getSyncLog(batchId: string) {
    const [log] = await db
      .select()
      .from(syncLog)
      .where(eq(syncLog.batchId, batchId))
      .limit(1);
    return log || null;
  }

  async getSyncConflicts(batchId: string) {
    const conflicts = await db
      .select()
      .from(syncConflict)
      .where(eq(syncConflict.batchId, batchId));
    return conflicts.map((c) => ({
      entity: c.entity,
      id_local: c.idLocal,
      error: c.error,
    }));
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

  private async generateProtocolo(etapa: string): Promise<string> {
    const year = new Date().getFullYear();

    const existingProtocols = await db
      .select({ protocoloLocal: matricula.protocoloLocal })
      .from(matricula)
      .where(sql`${matricula.protocoloLocal} LIKE ${`% - ${year} - %`}`)
      .orderBy(sql`${matricula.protocoloLocal} DESC`);

    const protocolosExistentes = existingProtocols.map((p) => p.protocoloLocal);

    // Usar o novo gerador de protocolos
    const { ProtocoloGenerator } = await import(
      "../utils/protocol-generator.js"
    );
    return ProtocoloGenerator.generateNext(etapa, protocolosExistentes, year);
  }
}

export const syncRepository = new SyncRepository();

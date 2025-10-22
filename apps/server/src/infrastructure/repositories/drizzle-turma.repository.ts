import { Turma } from "../../domain/entities/matricula.entity";
import type { TurmaRepository } from "../../domain/repositories";
import { db } from "../database/database.config";
import { turma } from "@matrifacil-/db/schema/matriculas.js";
import { eq, and, sql, desc } from "drizzle-orm";

export class DrizzleTurmaRepository implements TurmaRepository {
  async findById(id: string): Promise<Turma | null> {
    const [result] = await db
      .select()
      .from(turma)
      .where(eq(turma.id, id))
      .limit(1);

    if (!result) {
      return null;
    }

    return this.mapToTurma(result);
  }

  async findByEtapa(etapa: string): Promise<Turma[]> {
    const results = await db
      .select()
      .from(turma)
      .where(eq(turma.etapa, etapa as any))
      .orderBy(desc(turma.nome));

    return results.map(this.mapToTurma);
  }

  async findAvailableByEtapa(etapa: string): Promise<Turma[]> {
    const results = await db
      .select()
      .from(turma)
      .where(
        and(
          eq(turma.etapa, etapa as any),
          eq(turma.ativa, true),
          sql`${turma.vagasDisponiveis} > 0`
        )
      )
      .orderBy(desc(turma.vagasDisponiveis), desc(turma.nome));

    return results.map(this.mapToTurma);
  }

  async findBestForEtapa(etapa: string): Promise<Turma | null> {
    const results = await db
      .select()
      .from(turma)
      .where(
        and(
          eq(turma.etapa, etapa as any),
          eq(turma.ativa, true),
          sql`${turma.vagasDisponiveis} > 0`
        )
      )
      .orderBy(desc(turma.vagasDisponiveis), desc(turma.nome))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return this.mapToTurma(results[0]);
  }

  async decrementarVaga(turmaId: string): Promise<void> {
    await db
      .update(turma)
      .set({
        vagasDisponiveis: sql`${turma.vagasDisponiveis} - 1`,
      })
      .where(eq(turma.id, turmaId));
  }

  async incrementarVaga(turmaId: string): Promise<void> {
    await db
      .update(turma)
      .set({
        vagasDisponiveis: sql`${turma.vagasDisponiveis} + 1`,
      })
      .where(eq(turma.id, turmaId));
  }

  async validarVagasDisponiveis(turmaId: string): Promise<boolean> {
    const [result] = await db
      .select({ vagasDisponiveis: turma.vagasDisponiveis })
      .from(turma)
      .where(eq(turma.id, turmaId))
      .limit(1);

    return result ? result.vagasDisponiveis > 0 : false;
  }

  async validarTurmaAtiva(turmaId: string): Promise<boolean> {
    const [result] = await db
      .select({ ativa: turma.ativa })
      .from(turma)
      .where(eq(turma.id, turmaId))
      .limit(1);

    return result ? result.ativa : false;
  }

  async validarEtapaCompativel(
    turmaId: string,
    etapaAluno: string
  ): Promise<boolean> {
    const [result] = await db
      .select({ etapa: turma.etapa })
      .from(turma)
      .where(eq(turma.id, turmaId))
      .limit(1);

    return result ? result.etapa === etapaAluno : false;
  }

  async save(turmaEntity: Turma): Promise<Turma> {
    const [result] = await db
      .insert(turma)
      .values({
        id: turmaEntity.id,
        idGlobal: turmaEntity.idGlobal,
        nome: turmaEntity.nome,
        etapa: turmaEntity.etapa,
        turno: turmaEntity.turno,
        capacidade: turmaEntity.capacidade,
        vagasDisponiveis: turmaEntity.vagasDisponiveis,
        anoLetivo: turmaEntity.anoLetivo,
        ativa: turmaEntity.ativa,
        createdAt: turmaEntity.createdAt,
        updatedAt: turmaEntity.updatedAt,
      })
      .returning();

    return this.mapToTurma(result);
  }

  async update(turmaEntity: Turma): Promise<Turma> {
    await db
      .update(turma)
      .set({
        nome: turmaEntity.nome,
        etapa: turmaEntity.etapa,
        turno: turmaEntity.turno,
        capacidade: turmaEntity.capacidade,
        vagasDisponiveis: turmaEntity.vagasDisponiveis,
        anoLetivo: turmaEntity.anoLetivo,
        ativa: turmaEntity.ativa,
        updatedAt: new Date(),
      })
      .where(eq(turma.id, turmaEntity.id));

    return this.findById(turmaEntity.id) as Promise<Turma>;
  }

  async delete(id: string): Promise<void> {
    await db.delete(turma).where(eq(turma.id, id));
  }

  private mapToTurma(result: any): Turma {
    return Turma.create({
      id: result.id,
      idGlobal: result.idGlobal,
      nome: result.nome,
      etapa: result.etapa,
      turno: result.turno as any,
      capacidade: result.capacidade,
      vagasDisponiveis: result.vagasDisponiveis,
      anoLetivo: result.anoLetivo,
      ativa: result.ativa,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }
}

import { Turma } from "../../domain/entities/matricula.entity";
import { TurmaRepository } from "../../domain/repositories";

export class DrizzleTurmaRepository implements TurmaRepository {
  async findById(id: string): Promise<Turma | null> {
    return null;
  }

  async findByEtapa(etapa: string): Promise<Turma[]> {
    return [];
  }

  async findAvailableByEtapa(etapa: string): Promise<Turma[]> {
    return [];
  }

  async findBestForEtapa(etapa: string): Promise<Turma | null> {
    const mockTurmas = [
      {
        id: "turma-1",
        nome: "Berçário A",
        etapa: "bercario",
        turno: "integral",
        capacidade: 15,
        vagasDisponiveis: 3,
      },
      {
        id: "turma-2",
        nome: "Maternal A",
        etapa: "maternal",
        turno: "manha",
        capacidade: 20,
        vagasDisponiveis: 5,
      },
      {
        id: "turma-3",
        nome: "Maternal B",
        etapa: "maternal",
        turno: "tarde",
        capacidade: 20,
        vagasDisponiveis: 0,
      },
      {
        id: "turma-4",
        nome: "Pré-Escola A",
        etapa: "pre_escola",
        turno: "manha",
        capacidade: 25,
        vagasDisponiveis: 8,
      },
      {
        id: "turma-5",
        nome: "Pré-Escola B",
        etapa: "pre_escola",
        turno: "tarde",
        capacidade: 25,
        vagasDisponiveis: 5,
      },
      {
        id: "turma-6",
        nome: "Fundamental A",
        etapa: "fundamental",
        turno: "manha",
        capacidade: 30,
        vagasDisponiveis: 10,
      },
    ];

    const turmasDisponiveis = mockTurmas.filter(
      (t) => t.etapa === etapa && t.vagasDisponiveis > 0
    );

    if (turmasDisponiveis.length === 0) {
      return null;
    }

    const turma = turmasDisponiveis[0];
    return Turma.create({
      id: turma.id,
      idGlobal: turma.id,
      etapa: turma.etapa,
      turno: turma.turno as any,
      capacidade: turma.capacidade,
      vagasDisponiveis: turma.vagasDisponiveis,
      anoLetivo: "2024",
      nome: turma.nome,
      ativa: true,
    });
  }

  async save(turma: Turma): Promise<Turma> {
    return turma;
  }

  async update(turma: Turma): Promise<Turma> {
    return turma;
  }

  async delete(id: string): Promise<void> {}
}

import "dotenv/config";
import { db } from "../config/database.config.js";
import { turma } from "@matrifacil-/db/schema/matriculas.js";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

const turmasData = [
  // Berçário (0-1 ano)
  {
    nome: "Berçário A - Manhã",
    etapa: "bercario" as const,
    turno: "manha" as const,
    capacidade: 15,
    vagasDisponiveis: 15,
  },
  {
    nome: "Berçário A - Tarde",
    etapa: "bercario" as const,
    turno: "tarde" as const,
    capacidade: 15,
    vagasDisponiveis: 15,
  },
  {
    nome: "Berçário B - Integral",
    etapa: "bercario" as const,
    turno: "integral" as const,
    capacidade: 20,
    vagasDisponiveis: 20,
  },

  // Maternal (1-3 anos) - dividido em I e II
  {
    nome: "Maternal I A - Manhã",
    etapa: "maternal" as const,
    turno: "manha" as const,
    capacidade: 20,
    vagasDisponiveis: 18,
  },
  {
    nome: "Maternal I A - Tarde",
    etapa: "maternal" as const,
    turno: "tarde" as const,
    capacidade: 20,
    vagasDisponiveis: 15,
  },
  {
    nome: "Maternal I B - Integral",
    etapa: "maternal" as const,
    turno: "integral" as const,
    capacidade: 25,
    vagasDisponiveis: 20,
  },
  {
    nome: "Maternal II A - Manhã",
    etapa: "maternal" as const,
    turno: "manha" as const,
    capacidade: 20,
    vagasDisponiveis: 12,
  },
  {
    nome: "Maternal II A - Tarde",
    etapa: "maternal" as const,
    turno: "tarde" as const,
    capacidade: 20,
    vagasDisponiveis: 10,
  },

  // Pré-Escola (3-5 anos) - dividido em Jardim I e II
  {
    nome: "Pré I (Jardim I) A - Manhã",
    etapa: "pre_escola" as const,
    turno: "manha" as const,
    capacidade: 25,
    vagasDisponiveis: 22,
  },
  {
    nome: "Pré I (Jardim I) A - Tarde",
    etapa: "pre_escola" as const,
    turno: "tarde" as const,
    capacidade: 25,
    vagasDisponiveis: 20,
  },
  {
    nome: "Pré I (Jardim I) B - Integral",
    etapa: "pre_escola" as const,
    turno: "integral" as const,
    capacidade: 30,
    vagasDisponiveis: 25,
  },
  {
    nome: "Pré II (Jardim II) A - Manhã",
    etapa: "pre_escola" as const,
    turno: "manha" as const,
    capacidade: 25,
    vagasDisponiveis: 18,
  },
  {
    nome: "Pré II (Jardim II) A - Tarde",
    etapa: "pre_escola" as const,
    turno: "tarde" as const,
    capacidade: 25,
    vagasDisponiveis: 16,
  },

  // Fundamental (opcional - para expansão futura)
  {
    nome: "Fundamental I A - Manhã",
    etapa: "fundamental" as const,
    turno: "manha" as const,
    capacidade: 30,
    vagasDisponiveis: 25,
  },
  {
    nome: "Fundamental I A - Tarde",
    etapa: "fundamental" as const,
    turno: "tarde" as const,
    capacidade: 30,
    vagasDisponiveis: 22,
  },
];

async function seedTurmas() {
  console.log("🌱 Iniciando seed de turmas...");

  const anoLetivo = new Date().getFullYear().toString();

  try {
    for (const turmaData of turmasData) {
      // Verificar se a turma já existe
      const existingTurma = await db
        .select()
        .from(turma)
        .where(eq(turma.nome, turmaData.nome))
        .limit(1);

      if (existingTurma.length > 0) {
        console.log(`⏭️  Turma "${turmaData.nome}" já existe, pulando...`);
        continue;
      }

      // Inserir nova turma
      const turmaId = uuidv4();
      await db.insert(turma).values({
        id: turmaId,
        idGlobal: uuidv4(),
        nome: turmaData.nome,
        etapa: turmaData.etapa,
        turno: turmaData.turno,
        capacidade: turmaData.capacidade,
        vagasDisponiveis: turmaData.vagasDisponiveis,
        anoLetivo: anoLetivo,
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Turma "${turmaData.nome}" criada com sucesso!`);
    }

    console.log("\n🎉 Seed de turmas concluído com sucesso!");
    console.log(`📊 Total de turmas no sistema: ${turmasData.length}`);

    // Mostrar resumo por etapa
    const resumo = turmasData.reduce((acc, t) => {
      acc[t.etapa] = (acc[t.etapa] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("\n📈 Resumo por etapa:");
    Object.entries(resumo).forEach(([etapa, count]) => {
      console.log(`  - ${etapa}: ${count} turmas`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar seed de turmas:", error);
    process.exit(1);
  }
}

seedTurmas();

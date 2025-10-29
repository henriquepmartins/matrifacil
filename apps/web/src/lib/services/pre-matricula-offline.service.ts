import { db } from "../db";
import { ProtocoloGenerator } from "@/lib/utils/protocol-generator";

export interface PreMatriculaData {
  aluno: {
    nome: string;
    dataNascimento: string;
    etapa: string;
    necessidadesEspeciais: boolean;
    observacoes?: string;
  };
  responsavel: {
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    bairro: string;
    email?: string;
    parentesco: string;
    autorizadoRetirada: boolean;
  };
  observacoes?: string;
}

/**
 * Salva uma pré-matrícula localmente no IndexedDB quando offline
 */
export async function savePreMatriculaOffline(data: PreMatriculaData) {
  // Gerar IDs locais únicos
  const alunoId = crypto.randomUUID();
  const responsavelId = crypto.randomUUID();
  const matriculaId = crypto.randomUUID();

  const now = new Date();
  const protocoloLocal = ProtocoloGenerator.generate(data.aluno.etapa);

  console.log("💾 Salvando pré-matrícula offline...", {
    alunoId,
    responsavelId,
    matriculaId,
    protocoloLocal,
  });

  try {
    console.log("💾 Iniciando salvamento no IndexedDB...");

    // Salvar no IndexedDB em uma transação atômica
    await db.transaction(
      "rw",
      [db.alunos, db.responsaveis, db.matriculas],
      async () => {
        console.log("📝 Transação iniciada...");

        // Salvar aluno
        console.log("📝 Salvando aluno...");
        await db.alunos.add({
          id: alunoId,
          nome: data.aluno.nome,
          dataNascimento: new Date(data.aluno.dataNascimento),
          etapa: data.aluno.etapa as any,
          status: "pre",
          necessidadesEspeciais: data.aluno.necessidadesEspeciais,
          observacoes: data.aluno.observacoes,
          sync_status: "pending",
          createdAt: now,
          updatedAt: now,
        });

        console.log("✅ Aluno salvo localmente:", alunoId);

        // Salvar responsável
        console.log("📝 Salvando responsável...");
        await db.responsaveis.add({
          id: responsavelId,
          nome: data.responsavel.nome,
          cpf: data.responsavel.cpf,
          telefone: data.responsavel.telefone,
          endereco: data.responsavel.endereco,
          bairro: data.responsavel.bairro,
          email: data.responsavel.email,
          parentesco: data.responsavel.parentesco,
          autorizadoRetirada: data.responsavel.autorizadoRetirada,
          sync_status: "pending",
          createdAt: now,
          updatedAt: now,
        });

        console.log("✅ Responsável salvo localmente:", responsavelId);

        // Salvar matrícula (pré-matrícula)
        console.log("📝 Salvando matrícula...");
        await db.matriculas.add({
          id: matriculaId,
          protocoloLocal,
          alunoId,
          responsavelId,
          turmaId: undefined,
          status: "pre",
          observacoes: data.observacoes,
          sync_status: "pending",
          createdAt: now,
          updatedAt: now,
        });

        console.log("✅ Matrícula salva localmente:", matriculaId);
      }
    );

    console.log("🎉 Transação IndexedDB concluída com sucesso!");
  } catch (error: any) {
    console.error("❌ ERRO CRÍTICO ao salvar no IndexedDB:", error);
    console.error("📋 Detalhes do erro:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: (error as any)?.code,
    });

    // Re-throw com mensagem mais clara
    throw new Error(
      `Falha ao salvar dados localmente: ${
        error?.message || "Erro desconhecido"
      }. Por favor, verifique o console para mais detalhes.`
    );
  }

  console.log("🎉 Pré-matrícula salva offline com sucesso!");

  // Retornar os dados completos da pré-matrícula criada para atualização imediata do cache
  const preMatriculaCriada = {
    id: matriculaId,
    protocoloLocal,
    status: "pre" as const,
    observacoes: data.observacoes,
    createdAt: now,
    updatedAt: now,
    sync_status: "pending" as const,
    aluno: {
      id: alunoId,
      nome: data.aluno.nome,
      dataNascimento: data.aluno.dataNascimento,
      etapa: data.aluno.etapa,
      necessidadesEspeciais: data.aluno.necessidadesEspeciais,
      observacoes: data.aluno.observacoes,
    },
    responsavel: {
      id: responsavelId,
      nome: data.responsavel.nome,
      cpf: data.responsavel.cpf,
      telefone: data.responsavel.telefone,
      endereco: data.responsavel.endereco,
      bairro: data.responsavel.bairro,
      email: data.responsavel.email,
      parentesco: data.responsavel.parentesco,
      autorizadoRetirada: data.responsavel.autorizadoRetirada,
    },
  };

  return {
    matriculaId,
    protocoloLocal,
    alunoId,
    responsavelId,
    preMatriculaCriada,
  };
}

/**
 * Lista todas as pré-matrículas pendentes de sincronização
 */
export async function getPreMatriculasPendentes() {
  try {
    const matriculasPendentes = await db.matriculas
      .where("sync_status")
      .equals("pending")
      .toArray();

    console.log(
      `📋 Encontradas ${matriculasPendentes.length} pré-matrículas pendentes`
    );

    return matriculasPendentes;
  } catch (error: any) {
    console.error("❌ Erro ao listar pré-matrículas pendentes:", error);
    throw new Error(
      `Falha ao listar pré-matrículas pendentes: ${
        error?.message || "Erro desconhecido"
      }`
    );
  }
}

/**
 * Deleta uma pré-matrícula localmente (antes de ser sincronizada)
 */
export async function deletePreMatriculaLocal(
  matriculaId: string
): Promise<void> {
  try {
    // Buscar a matrícula
    const matricula = await db.matriculas.get(matriculaId);

    if (!matricula) {
      throw new Error("Pré-matrícula não encontrada");
    }

    // Se já foi sincronizada, não permite deletar
    if (matricula.sync_status === "synced") {
      throw new Error(
        "Não é possível deletar uma pré-matrícula que já foi sincronizada"
      );
    }

    // Deletar em transação atômica
    await db.transaction(
      "rw",
      [db.alunos, db.responsaveis, db.matriculas],
      async () => {
        // Buscar aluno e responsável relacionados
        const aluno = await db.alunos.get(matricula.alunoId);
        const responsavel = await db.responsaveis.get(matricula.responsavelId);

        // Deletar matrícula
        await db.matriculas.delete(matriculaId);

        // Deletar aluno se existir e não tiver sido sincronizado
        if (aluno && aluno.sync_status === "pending") {
          await db.alunos.delete(aluno.id);
        }

        // Deletar responsável se existir e não tiver sido sincronizado
        if (responsavel && responsavel.sync_status === "pending") {
          await db.responsaveis.delete(responsavel.id);
        }
      }
    );

    console.log(`🗑️ Pré-matrícula ${matriculaId} deletada com sucesso`);
  } catch (error: any) {
    console.error("❌ Erro ao deletar pré-matrícula local:", error);
    throw new Error(
      `Falha ao deletar pré-matrícula: ${error?.message || "Erro desconhecido"}`
    );
  }
}

/**
 * Valida se um CPF já existe no IndexedDB
 */
export async function checkCPFExists(cpf: string): Promise<boolean> {
  try {
    const cpfFormatted = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
    const existing = await db.responsaveis
      .where("cpf")
      .equals(cpfFormatted)
      .first();

    return !!existing;
  } catch (error: any) {
    console.error("❌ Erro ao verificar CPF:", error);
    return false;
  }
}

/**
 * Obtém estatísticas de pré-matrículas offline
 */
export async function getPreMatriculasStats() {
  try {
    const total = await db.matriculas.count();
    const pendentes = await db.matriculas
      .where("sync_status")
      .equals("pending")
      .count();
    const sincronizadas = await db.matriculas
      .where("sync_status")
      .equals("synced")
      .count();

    return {
      total,
      pendentes,
      sincronizadas,
      conflicts: total - pendentes - sincronizadas,
    };
  } catch (error: any) {
    console.error("❌ Erro ao obter estatísticas:", error);
    return {
      total: 0,
      pendentes: 0,
      sincronizadas: 0,
      conflicts: 0,
    };
  }
}

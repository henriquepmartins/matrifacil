import { db } from "../db";
import { apiClient } from "../api-client";

/**
 * Busca matrículas do servidor e faz cache no IndexedDB
 */
export async function cacheMatriculasFromServer() {
  try {
    console.log("🌐 Buscando matrículas do servidor para cache...");
    const result = await apiClient.get("/api/matriculas");
    const matriculas = (result as any)?.data || [];

    console.log(`📦 ${matriculas.length} matrículas recebidas do servidor`);

    // Cache no IndexedDB
    for (const item of matriculas) {
      // Cache aluno
      if (item.aluno) {
        await db.alunos.put({
          id: item.aluno.id,
          idGlobal: item.aluno.id,
          nome: item.aluno.nome,
          dataNascimento: new Date(item.aluno.dataNascimento),
          etapa: item.aluno.etapa,
          status: item.status,
          necessidadesEspeciais: item.aluno.necessidadesEspeciais || false,
          observacoes: item.aluno.observacoes,
          sync_status: "synced",
          synced_at: Date.now(),
          createdAt: new Date(item.aluno.createdAt),
          updatedAt: new Date(item.aluno.updatedAt),
        });
      }

      // Cache responsável
      if (item.responsavel) {
        await db.responsaveis.put({
          id: item.responsavel.id,
          idGlobal: item.responsavel.id,
          nome: item.responsavel.nome,
          cpf: item.responsavel.cpf,
          telefone: item.responsavel.telefone,
          endereco: item.responsavel.endereco,
          bairro: item.responsavel.bairro,
          email: item.responsavel.email,
          parentesco: item.responsavel.parentesco,
          autorizadoRetirada: item.responsavel.autorizadoRetirada,
          sync_status: "synced",
          synced_at: Date.now(),
          createdAt: new Date(item.responsavel.createdAt),
          updatedAt: new Date(item.responsavel.updatedAt),
        });
      }

      // Cache turma (se houver)
      if (item.turma) {
        await db.turmas.put({
          id: item.turma.id,
          idGlobal: item.turma.id,
          nome: item.turma.nome,
          etapa: item.turma.etapa,
          turno: item.turma.turno,
          capacidade: item.turma.capacidade || 0,
          vagasDisponiveis: item.turma.vagasDisponiveis || 0,
          anoLetivo: item.turma.anoLetivo,
          ativa: item.turma.ativa,
          sync_status: "synced",
          synced_at: Date.now(),
          createdAt: new Date(item.turma.createdAt),
          updatedAt: new Date(item.turma.updatedAt),
        });
      }

      // Cache matrícula
      await db.matriculas.put({
        id: item.id,
        idGlobal: item.id,
        protocoloLocal: item.protocoloLocal,
        alunoId: item.aluno?.id,
        responsavelId: item.responsavel?.id,
        turmaId: item.turma?.id,
        status: item.status,
        dataMatricula: item.dataMatricula
          ? new Date(item.dataMatricula)
          : undefined,
        observacoes: item.observacoes,
        sync_status: "synced",
        synced_at: Date.now(),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      });
    }

    console.log(`✅ ${matriculas.length} matrículas cacheadas no IndexedDB`);
    return matriculas;
  } catch (error) {
    console.error("❌ Erro ao cachear matrículas:", error);
    throw error;
  }
}

/**
 * Busca matrículas do cache local (IndexedDB)
 */
export async function getMatriculasFromCache() {
  console.log("📂 Buscando matrículas do cache local...");

  const matriculas = await db.matriculas.toArray();

  console.log(`📦 ${matriculas.length} matrículas encontradas no cache`);

  // Buscar dados relacionados (aluno, responsável, turma)
  const result = await Promise.all(
    matriculas.map(async (m) => {
      const aluno = await db.alunos.get(m.alunoId);
      const responsavel = await db.responsaveis.get(m.responsavelId);
      const turma = m.turmaId ? await db.turmas.get(m.turmaId) : null;

      return {
        ...m,
        aluno,
        responsavel,
        turma,
      };
    })
  );

  console.log(
    `✅ Dados relacionados carregados para ${result.length} matrículas`
  );

  return result;
}

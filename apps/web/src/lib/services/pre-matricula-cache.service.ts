import { db } from "../db";
import { apiClient } from "../api-client";

/**
 * Busca pré-matrículas do servidor e faz cache no IndexedDB
 */
export async function cachePreMatriculasFromServer() {
  try {
    console.log("🌐 Buscando pré-matrículas do servidor para cache...");
    const result = await apiClient.get("/api/pre-matriculas");
    const preMatriculas = (result as any)?.data || [];

    console.log(
      `📦 ${preMatriculas.length} pré-matrículas recebidas do servidor`
    );

    // Cache no IndexedDB
    for (const item of preMatriculas) {
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
          createdAt: new Date(item.aluno.createdAt || item.createdAt),
          updatedAt: new Date(item.aluno.updatedAt || item.updatedAt),
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
          createdAt: new Date(item.responsavel.createdAt || item.createdAt),
          updatedAt: new Date(item.responsavel.updatedAt || item.updatedAt),
        });
      }

      // Cache matrícula (pré-matrícula)
      await db.matriculas.put({
        id: item.id,
        idGlobal: item.id,
        protocoloLocal: item.protocoloLocal,
        alunoId: item.aluno?.id,
        responsavelId: item.responsavel?.id,
        status: item.status,
        observacoes: item.observacoes,
        sync_status: "synced",
        synced_at: Date.now(),
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      });
    }

    console.log(
      `✅ ${preMatriculas.length} pré-matrículas cacheadas no IndexedDB`
    );
    return preMatriculas;
  } catch (error) {
    console.warn(
      "⚠️ Servidor offline ou erro de conexão, usando apenas cache local"
    );
    // Retornar dados do cache ao invés de lançar erro
    return getPreMatriculasFromCache();
  }
}

/**
 * Busca pré-matrículas do cache local (IndexedDB)
 */
export async function getPreMatriculasFromCache() {
  console.log("📂 Buscando pré-matrículas do cache local...");

  // Buscar apenas matrículas com status "pre"
  const matriculas = await db.matriculas
    .where("status")
    .equals("pre")
    .toArray();

  console.log(`📦 ${matriculas.length} pré-matrículas encontradas no cache`);

  // Buscar dados relacionados (aluno, responsável)
  const result = await Promise.all(
    matriculas.map(async (m) => {
      const aluno = await db.alunos.get(m.alunoId);
      const responsavel = await db.responsaveis.get(m.responsavelId);

      return {
        id: m.idGlobal || m.id, // Priorizar ID global quando sincronizado
        idLocal: m.id, // Manter referência ao ID local
        protocoloLocal: m.protocoloLocal,
        status: m.status,
        observacoes: m.observacoes,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        aluno,
        responsavel,
        sync_status: m.sync_status, // Adicionar sync_status
      };
    })
  );

  console.log(
    `✅ Dados relacionados carregados para ${result.length} pré-matrículas`
  );

  return result;
}

/**
 * Busca todas as pré-matrículas (synced + pending) do cache local
 */
export async function getAllPreMatriculas() {
  console.log("📂 Buscando TODAS as pré-matrículas do cache local...");

  // Buscar todas as matrículas com status "pre"
  const matriculas = await db.matriculas
    .where("status")
    .equals("pre")
    .toArray();

  console.log(`📦 ${matriculas.length} pré-matrículas encontradas no cache`);
  
  // Debug: Mostrar IDs brutos do IndexedDB
  console.log("🔍 IDs brutos do IndexedDB:", 
    matriculas.map(m => ({ 
      id: m.id, 
      idGlobal: m.idGlobal, 
      sync_status: m.sync_status,
      protocolo: m.protocoloLocal 
    }))
  );

  // Buscar dados relacionados e incluir sync_status
  const result = await Promise.all(
    matriculas.map(async (m) => {
      const aluno = await db.alunos.get(m.alunoId);
      const responsavel = await db.responsaveis.get(m.responsavelId);

      return {
        id: m.idGlobal || m.id, // Priorizar ID global quando sincronizado
        idLocal: m.id, // Manter referência ao ID local
        protocoloLocal: m.protocoloLocal,
        status: m.status,
        observacoes: m.observacoes,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        aluno,
        responsavel,
        sync_status: m.sync_status, // Adicionar sync_status
      };
    })
  );

  console.log(
    `✅ Dados relacionados carregados para ${result.length} pré-matrículas`
  );

  return result;
}

/**
 * Força a atualização do cache local (útil após operações offline)
 */
export async function refreshPreMatriculasCache() {
  console.log("🔄 Forçando atualização do cache de pré-matrículas...");

  try {
    // Tentar buscar do servidor se online
    if (typeof window !== "undefined" && navigator.onLine) {
      console.log("🌐 Online - tentando atualizar do servidor...");
      try {
        await cachePreMatriculasFromServer();
        console.log("✅ Cache atualizado do servidor");
      } catch (error) {
        console.warn(
          "⚠️ Erro ao atualizar do servidor, usando apenas cache local:",
          error
        );
      }
    }

    // Sempre retornar dados locais atualizados
    return getAllPreMatriculas();
  } catch (error) {
    console.error("❌ Erro ao atualizar cache:", error);
    throw error;
  }
}

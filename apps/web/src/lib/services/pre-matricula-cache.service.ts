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
      // Cache aluno - buscar se já existe antes de atualizar
      if (item.aluno) {
        // Tentar buscar pelo ID direto primeiro
        let existingAluno = await db.alunos.get(item.aluno.id);
        
        // Se não encontrou, buscar pelo idGlobal (buscar todos e filtrar)
        if (!existingAluno) {
          const allAlunos = await db.alunos.toArray();
          existingAluno = allAlunos.find(a => a.idGlobal === item.aluno.id);
        }

        if (existingAluno) {
          await db.alunos.update(existingAluno.id, {
            idGlobal: item.aluno.id,
            nome: item.aluno.nome,
            dataNascimento: new Date(item.aluno.dataNascimento),
            etapa: item.aluno.etapa,
            status: item.status,
            necessidadesEspeciais: item.aluno.necessidadesEspeciais || false,
            observacoes: item.aluno.observacoes,
            sync_status: "synced",
            synced_at: Date.now(),
            updatedAt: new Date(item.aluno.updatedAt || item.updatedAt),
          } as any);
        } else {
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
      }

      // Cache responsável - buscar se já existe antes de atualizar
      if (item.responsavel) {
        // Tentar buscar pelo ID direto primeiro
        let existingResponsavel = await db.responsaveis.get(item.responsavel.id);
        
        // Se não encontrou, buscar pelo idGlobal (buscar todos e filtrar)
        if (!existingResponsavel) {
          const allResponsaveis = await db.responsaveis.toArray();
          existingResponsavel = allResponsaveis.find(r => r.idGlobal === item.responsavel.id);
        }

        if (existingResponsavel) {
          await db.responsaveis.update(existingResponsavel.id, {
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
            updatedAt: new Date(item.responsavel.updatedAt || item.updatedAt),
          } as any);
        } else {
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
      }

      // Cache matrícula (pré-matrícula)
      // Buscar se já existe uma matrícula com este idGlobal ou id local
      // Tentar buscar pelo ID direto primeiro
      let existingMatricula = await db.matriculas.get(item.id);
      
      // Se não encontrou, buscar pelo idGlobal (buscar todos e filtrar)
      if (!existingMatricula) {
        const allMatriculas = await db.matriculas.toArray();
        existingMatricula = allMatriculas.find(m => m.idGlobal === item.id);
      }

      if (existingMatricula) {
        // Atualizar registro existente
        await db.matriculas.update(existingMatricula.id, {
          idGlobal: item.id,
          protocoloLocal: item.protocoloLocal,
          alunoId: item.aluno?.id,
          responsavelId: item.responsavel?.id,
          status: item.status,
          observacoes: item.observacoes,
          sync_status: "synced",
          synced_at: Date.now(),
          updatedAt: new Date(item.updatedAt),
        } as any);
      } else {
        // Criar novo registro
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
 * Busca um aluno no IndexedDB por ID (local ou global)
 */
async function findAlunoById(id: string) {
  // Tentar buscar pelo ID direto primeiro
  let aluno = await db.alunos.get(id);
  
  // Se não encontrou, tentar buscar pelo idGlobal
  if (!aluno) {
    const alunos = await db.alunos.toArray();
    aluno = alunos.find(a => a.idGlobal === id);
  }
  
  return aluno;
}

/**
 * Busca um responsável no IndexedDB por ID (local ou global)
 */
async function findResponsavelById(id: string) {
  // Tentar buscar pelo ID direto primeiro
  let responsavel = await db.responsaveis.get(id);
  
  // Se não encontrou, tentar buscar pelo idGlobal
  if (!responsavel) {
    const responsaveis = await db.responsaveis.toArray();
    responsavel = responsaveis.find(r => r.idGlobal === id);
  }
  
  return responsavel;
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
      const aluno = await findAlunoById(m.alunoId);
      const responsavel = await findResponsavelById(m.responsavelId);

      if (!aluno || !responsavel) {
        console.warn(`⚠️ Dados incompletos para matrícula ${m.id}:`, {
          alunoId: m.alunoId,
          responsavelId: m.responsavelId,
          alunoEncontrado: !!aluno,
          responsavelEncontrado: !!responsavel,
        });
      }

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
      protocolo: m.protocoloLocal,
      alunoId: m.alunoId,
      responsavelId: m.responsavelId,
    }))
  );

  // Buscar dados relacionados e incluir sync_status
  const result = await Promise.all(
    matriculas.map(async (m) => {
      const aluno = await findAlunoById(m.alunoId);
      const responsavel = await findResponsavelById(m.responsavelId);

      if (!aluno || !responsavel) {
        console.warn(`⚠️ Dados incompletos para matrícula ${m.id}:`, {
          alunoId: m.alunoId,
          responsavelId: m.responsavelId,
          alunoEncontrado: !!aluno,
          responsavelEncontrado: !!responsavel,
          sync_status: m.sync_status,
        });
      }

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

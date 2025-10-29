import { Router } from "express";
import { db } from "@matrifacil-/db/index.js";
import { responsavel, turma } from "@matrifacil-/db/schema/matriculas.js";
import { v4 as uuidv4 } from "uuid";
import { sql, eq } from "drizzle-orm";

const router = Router();

router.post("/test-simple-insert", async (req, res) => {
  try {
    console.log("🧪 Testando inserção simples com SQL raw...");

    const responsavelId = uuidv4();
    const idGlobal = uuidv4();

    const result = await db.execute(sql`
      INSERT INTO responsavel (
        id, id_global, nome, cpf, telefone, endereco, bairro, email
      ) VALUES (
        ${responsavelId}, ${idGlobal}, 'Teste Simples', '11122233344', '11999887766', 
        'Rua Teste Simples, 123', 'Bairro Teste Simples', 'teste@email.com'
      ) RETURNING id, nome, cpf
    `);

    console.log("✅ Inserção simples bem-sucedida:", result);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Erro na inserção simples:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/clear-database", async (req, res) => {
  try {
    console.log("🧹 Limpando banco de dados completamente...");
    console.log("=====================================");

    // Contar registros antes de deletar
    const countsBefore: Record<string, number> = {};
    
    try {
      const pendenciaResult = await db.execute(sql`SELECT COUNT(*) as count FROM pendencia`);
      countsBefore.pendencia = Number(pendenciaResult.rows[0]?.count || 0);
      
      const documentoResult = await db.execute(sql`SELECT COUNT(*) as count FROM documento`);
      countsBefore.documento = Number(documentoResult.rows[0]?.count || 0);
      
      const contatoEmergenciaResult = await db.execute(sql`SELECT COUNT(*) as count FROM contato_emergencia`);
      countsBefore.contatoEmergencia = Number(contatoEmergenciaResult.rows[0]?.count || 0);
      
      const matriculaResult = await db.execute(sql`SELECT COUNT(*) as count FROM matricula`);
      countsBefore.matricula = Number(matriculaResult.rows[0]?.count || 0);
      
      const alunoResult = await db.execute(sql`SELECT COUNT(*) as count FROM aluno`);
      countsBefore.aluno = Number(alunoResult.rows[0]?.count || 0);
      
      const responsavelResult = await db.execute(sql`SELECT COUNT(*) as count FROM responsavel`);
      countsBefore.responsavel = Number(responsavelResult.rows[0]?.count || 0);
      
      const turmaResult = await db.execute(sql`SELECT COUNT(*) as count FROM turma`);
      countsBefore.turma = Number(turmaResult.rows[0]?.count || 0);
      
      const sessionResult = await db.execute(sql`SELECT COUNT(*) as count FROM session`);
      countsBefore.session = Number(sessionResult.rows[0]?.count || 0);
      
      const accountResult = await db.execute(sql`SELECT COUNT(*) as count FROM account`);
      countsBefore.account = Number(accountResult.rows[0]?.count || 0);
      
      const verificationResult = await db.execute(sql`SELECT COUNT(*) as count FROM verification`);
      countsBefore.verification = Number(verificationResult.rows[0]?.count || 0);
      
      const userResult = await db.execute(sql`SELECT COUNT(*) as count FROM "user"`);
      countsBefore.user = Number(userResult.rows[0]?.count || 0);
    } catch (err) {
      console.warn("⚠️ Erro ao contar registros:", err);
    }

    console.log("📊 Registros encontrados antes da limpeza:");
    Object.entries(countsBefore).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`   ${table}: ${count} registros`);
      }
    });
    console.log("");

    // Limpar todas as tabelas na ordem correta (respeitando foreign keys)
    // Ordem: primeiro tabelas filhas, depois tabelas pais
    
    console.log("🗑️ Iniciando limpeza...");
    
    // 1. Tabelas que dependem de matricula
    await db.execute(sql`DELETE FROM pendencia`);
    console.log("   ✅ pendencia limpa");
    
    await db.execute(sql`DELETE FROM documento`);
    console.log("   ✅ documento limpa");
    
    await db.execute(sql`DELETE FROM contato_emergencia`);
    console.log("   ✅ contato_emergencia limpa");
    
    // 2. Matrículas (depende de aluno, responsavel, turma)
    await db.execute(sql`DELETE FROM matricula`);
    console.log("   ✅ matricula limpa");
    
    // 3. Tabelas independentes/principais
    await db.execute(sql`DELETE FROM aluno`);
    console.log("   ✅ aluno limpa");
    
    await db.execute(sql`DELETE FROM responsavel`);
    console.log("   ✅ responsavel limpa");
    
    await db.execute(sql`DELETE FROM turma`);
    console.log("   ✅ turma limpa");
    
    // 4. Tabelas de autenticação (dependem de user)
    await db.execute(sql`DELETE FROM session`);
    console.log("   ✅ session limpa");
    
    await db.execute(sql`DELETE FROM account`);
    console.log("   ✅ account limpa");
    
    await db.execute(sql`DELETE FROM verification`);
    console.log("   ✅ verification limpa");
    
    // 5. User por último (não deve ter usuários, mas limpa por garantia)
    // NOTA: Você pode querer manter pelo menos um usuário admin
    // Descomente a linha abaixo se quiser limpar usuários também
    // await db.execute(sql`DELETE FROM "user"`);
    // console.log("   ✅ user limpa");

    // Verificar limpeza
    console.log("\n📊 Verificando limpeza...");
    const countsAfter: Record<string, number> = {};
    
    try {
      const pendenciaAfterResult = await db.execute(sql`SELECT COUNT(*) as count FROM pendencia`);
      countsAfter.pendencia = Number(pendenciaAfterResult.rows[0]?.count || 0);
      
      const documentoAfterResult = await db.execute(sql`SELECT COUNT(*) as count FROM documento`);
      countsAfter.documento = Number(documentoAfterResult.rows[0]?.count || 0);
      
      const contatoEmergenciaAfterResult = await db.execute(sql`SELECT COUNT(*) as count FROM contato_emergencia`);
      countsAfter.contatoEmergencia = Number(contatoEmergenciaAfterResult.rows[0]?.count || 0);
      
      const matriculaAfterResult = await db.execute(sql`SELECT COUNT(*) as count FROM matricula`);
      countsAfter.matricula = Number(matriculaAfterResult.rows[0]?.count || 0);
      
      const alunoAfterResult = await db.execute(sql`SELECT COUNT(*) as count FROM aluno`);
      countsAfter.aluno = Number(alunoAfterResult.rows[0]?.count || 0);
      
      const responsavelAfterResult = await db.execute(sql`SELECT COUNT(*) as count FROM responsavel`);
      countsAfter.responsavel = Number(responsavelAfterResult.rows[0]?.count || 0);
      
      const turmaAfterResult = await db.execute(sql`SELECT COUNT(*) as count FROM turma`);
      countsAfter.turma = Number(turmaAfterResult.rows[0]?.count || 0);
    } catch (err) {
      console.warn("⚠️ Erro ao verificar contagem:", err);
    }

    const totalRemoved = Object.values(countsBefore).reduce((sum, count) => sum + count, 0);
    const totalRemaining = Object.values(countsAfter).reduce((sum, count) => sum + count, 0);

    console.log("=====================================");
    console.log("✅ BANCO DE DADOS LIMPO COM SUCESSO!");
    console.log(`📊 Total de registros removidos: ${totalRemoved}`);
    console.log(`📊 Registros restantes: ${totalRemaining}`);
    console.log("\n💡 Próximos passos:");
    console.log("   1. Execute os scripts de seed para popular o banco");
    console.log("   2. Para criar turmas: POST /api/test/seed-turmas");
    console.log("   3. Para criar admin: execute o script seed-admin.ts");

    res.json({
      success: true,
      message: "Banco de dados limpo completamente",
      removed: countsBefore,
      remaining: countsAfter,
      totalRemoved,
      totalRemaining,
    });
  } catch (error: any) {
    console.error("❌ Erro ao limpar banco:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

router.get("/check-cpf/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;
    console.log(`🔍 Verificando CPF: ${cpf}`);

    const result = await db.execute(sql`
      SELECT id, nome, cpf, created_at 
      FROM responsavel 
      WHERE cpf = ${cpf}
    `);

    console.log(`📋 CPF ${cpf} encontrado:`, result.rows);
    res.json({
      success: true,
      cpf,
      exists: result.rows.length > 0,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Erro ao verificar CPF:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/check-matricula/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Verificando matrícula: ${id}`);

    const result = await db.execute(sql`
      SELECT m.id, m.status, m.data_matricula, m.created_at, m.updated_at,
             a.id as aluno_id, a.status as aluno_status,
             r.id as responsavel_id, r.nome as responsavel_nome
      FROM matricula m
      LEFT JOIN aluno a ON m.aluno_id = a.id
      LEFT JOIN responsavel r ON m.responsavel_id = r.id
      WHERE m.id = ${id}
    `);

    console.log(`📋 Matrícula ${id} encontrada:`, result.rows);
    res.json({ success: true, matricula: result.rows[0] || null });
  } catch (error) {
    console.error("❌ Erro ao verificar matrícula:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/table-structure", async (req, res) => {
  try {
    console.log("🔍 Verificando estrutura da tabela responsavel...");

    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'responsavel' 
      ORDER BY ordinal_position
    `);

    console.log("📋 Estrutura da tabela responsavel:", result.rows);
    res.json({ success: true, structure: result.rows });
  } catch (error) {
    console.error("❌ Erro ao verificar estrutura:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/test-raw-insert", async (req, res) => {
  try {
    console.log("🧪 Testando inserção com SQL raw...");

    const responsavelId = uuidv4();
    const idGlobal = uuidv4();

    const result = await db.execute(sql`
      INSERT INTO responsavel (
        id, id_global, nome, cpf, telefone, endereco, bairro, email, parentesco, autorizado_retirada
      ) VALUES (
        ${responsavelId}, ${idGlobal}, 'Teste Raw', '98765432100', '11999887766', 
        'Rua Teste Raw, 123', 'Bairro Teste Raw', 'teste@email.com', 'pai', true
      ) RETURNING id, nome, cpf
    `);

    console.log("✅ Inserção raw bem-sucedida:", result);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Erro na inserção raw:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/apply-migration", async (req, res) => {
  try {
    console.log("🔄 Aplicando migração...");

    await db.execute(
      sql`ALTER TABLE "aluno" ALTER COLUMN "nacionalidade" DROP DEFAULT`
    );
    await db.execute(
      sql`ALTER TABLE "responsavel" ALTER COLUMN "nacionalidade" DROP DEFAULT`
    );

    console.log("✅ Migração aplicada com sucesso!");
    res.json({ success: true, message: "Migração aplicada" });
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/test-insert", async (req, res) => {
  try {
    console.log("🧪 Testando inserção simples...");

    const [result] = await db
      .insert(responsavel)
      .values({
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Teste",
        cpf: "11144477735",
        telefone: "11988776655",
        endereco: "Rua Teste, 123",
        bairro: "Bairro Teste",
        email: "teste@email.com",
        parentesco: "pai",
        autorizadoRetirada: true,
      })
      .returning();

    console.log("✅ Inserção bem-sucedida:", result);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Erro na inserção:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/check-turmas", async (req, res) => {
  try {
    console.log("🔍 Verificando turmas...");

    const result = await db.execute(sql`
      SELECT id, nome, etapa, turno, capacidade, vagas_disponiveis, ano_letivo, ativa
      FROM turma
      ORDER BY nome
    `);

    console.log(`📋 Turmas encontradas:`, result.rows);
    res.json({ success: true, turmas: result.rows });
  } catch (error) {
    console.error("❌ Erro ao verificar turmas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/seed-turmas", async (req, res) => {
  try {
    console.log("🌱 Iniciando seed de turmas...");

    const anoLetivo = new Date().getFullYear().toString();
    const turmasData = [
      // Berçário (0 a 1 ano)
      {
        nome: "Berçário A - Manhã",
        etapa: "bercario",
        turno: "manha",
        capacidade: 15,
        vagasDisponiveis: 15,
      },
      {
        nome: "Berçário A - Tarde",
        etapa: "bercario",
        turno: "tarde",
        capacidade: 15,
        vagasDisponiveis: 15,
      },
      {
        nome: "Berçário B - Integral",
        etapa: "bercario",
        turno: "integral",
        capacidade: 20,
        vagasDisponiveis: 20,
      },

      // Maternal I (1 a 2 anos)
      {
        nome: "Maternal I A - Manhã",
        etapa: "maternal",
        turno: "manha",
        capacidade: 18,
        vagasDisponiveis: 18,
      },
      {
        nome: "Maternal I A - Tarde",
        etapa: "maternal",
        turno: "tarde",
        capacidade: 18,
        vagasDisponiveis: 18,
      },
      {
        nome: "Maternal I B - Integral",
        etapa: "maternal",
        turno: "integral",
        capacidade: 20,
        vagasDisponiveis: 20,
      },

      // Maternal II (2 a 3 anos)
      {
        nome: "Maternal II A - Manhã",
        etapa: "maternal",
        turno: "manha",
        capacidade: 20,
        vagasDisponiveis: 20,
      },
      {
        nome: "Maternal II A - Tarde",
        etapa: "maternal",
        turno: "tarde",
        capacidade: 20,
        vagasDisponiveis: 20,
      },
      {
        nome: "Maternal II B - Integral",
        etapa: "maternal",
        turno: "integral",
        capacidade: 22,
        vagasDisponiveis: 22,
      },

      // Pré I (ou Jardim I) (3 a 4 anos)
      {
        nome: "Pré I (Jardim I) A - Manhã",
        etapa: "pre_escola",
        turno: "manha",
        capacidade: 25,
        vagasDisponiveis: 25,
      },
      {
        nome: "Pré I (Jardim I) A - Tarde",
        etapa: "pre_escola",
        turno: "tarde",
        capacidade: 25,
        vagasDisponiveis: 25,
      },
      {
        nome: "Pré I (Jardim I) B - Integral",
        etapa: "pre_escola",
        turno: "integral",
        capacidade: 28,
        vagasDisponiveis: 28,
      },

      // Pré II (ou Jardim II) (4 a 5 anos)
      {
        nome: "Pré II (Jardim II) A - Manhã",
        etapa: "pre_escola",
        turno: "manha",
        capacidade: 30,
        vagasDisponiveis: 30,
      },
      {
        nome: "Pré II (Jardim II) A - Tarde",
        etapa: "pre_escola",
        turno: "tarde",
        capacidade: 30,
        vagasDisponiveis: 30,
      },
      {
        nome: "Pré II (Jardim II) B - Integral",
        etapa: "pre_escola",
        turno: "integral",
        capacidade: 32,
        vagasDisponiveis: 32,
      },
    ];

    let criadas = 0;
    let jaExistentes = 0;

    for (const turmaData of turmasData) {
      // Verificar se já existe
      const existing = await db
        .select()
        .from(turma)
        .where(eq(turma.nome, turmaData.nome))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Turma "${turmaData.nome}" já existe`);
        jaExistentes++;
        continue;
      }

      // Inserir nova turma
      await db.insert(turma).values({
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: turmaData.nome,
        etapa: turmaData.etapa as any,
        turno: turmaData.turno as any,
        capacidade: turmaData.capacidade,
        vagasDisponiveis: turmaData.vagasDisponiveis,
        anoLetivo: anoLetivo,
        ativa: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Turma "${turmaData.nome}" criada`);
      criadas++;
    }

    console.log(
      `\n🎉 Seed concluído! ${criadas} criadas, ${jaExistentes} já existiam`
    );
    res.json({
      success: true,
      message: `${criadas} turmas criadas, ${jaExistentes} já existiam`,
      criadas,
      jaExistentes,
      total: turmasData.length,
    });
  } catch (error) {
    console.error("❌ Erro ao criar turmas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rota rápida para adicionar turmas de Fundamental
router.post("/add-fundamental-turmas", async (req, res) => {
  try {
    console.log("🏫 Adicionando turmas de Fundamental...");

    const turmasFundamental = [
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "1º Ano - Manhã",
        etapa: "fundamental",
        turno: "manha",
        capacidade: 25,
        vagasDisponiveis: 25,
        anoLetivo: "2025",
        ativa: true,
      },
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "1º Ano - Tarde",
        etapa: "fundamental",
        turno: "tarde",
        capacidade: 25,
        vagasDisponiveis: 25,
        anoLetivo: "2025",
        ativa: true,
      },
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "1º Ano - Integral",
        etapa: "fundamental",
        turno: "integral",
        capacidade: 20,
        vagasDisponiveis: 20,
        anoLetivo: "2025",
        ativa: true,
      },
    ];

    for (const turmaData of turmasFundamental) {
      try {
        await db.insert(turma).values(turmaData);
        console.log(`✅ Turma criada: ${turmaData.nome}`);
      } catch (err) {
        console.log(`⚠️ Turma já existe ou erro: ${turmaData.nome}`);
      }
    }

    console.log("✅ Turmas de Fundamental processadas!");
    res.json({
      success: true,
      message: `Turmas de Fundamental processadas com sucesso`,
      turmas: turmasFundamental,
    });
  } catch (error) {
    console.error("❌ Erro ao criar turmas de Fundamental:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/add-more-turmas", async (req, res) => {
  try {
    console.log("🏫 Adicionando turmas adicionais...");

    const turmasAdicionais = [
      // Berçário Integral
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Berçário - Integral",
        etapa: "bercario",
        turno: "integral",
        capacidade: 10,
        vagasDisponiveis: 10,
        anoLetivo: "2025",
        ativa: true,
      },
      // Maternal I e II
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Maternal I - Integral",
        etapa: "maternal",
        turno: "integral",
        capacidade: 12,
        vagasDisponiveis: 12,
        anoLetivo: "2025",
        ativa: true,
      },
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Maternal II A - Manhã",
        etapa: "maternal",
        turno: "manha",
        capacidade: 18,
        vagasDisponiveis: 18,
        anoLetivo: "2025",
        ativa: true,
      },
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Maternal II B - Tarde",
        etapa: "maternal",
        turno: "tarde",
        capacidade: 18,
        vagasDisponiveis: 18,
        anoLetivo: "2025",
        ativa: true,
      },
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Maternal II - Integral",
        etapa: "maternal",
        turno: "integral",
        capacidade: 15,
        vagasDisponiveis: 15,
        anoLetivo: "2025",
        ativa: true,
      },
      // Pré I e Pré II
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Pré I (Jardim I) - Integral",
        etapa: "pre_escola",
        turno: "integral",
        capacidade: 18,
        vagasDisponiveis: 18,
        anoLetivo: "2025",
        ativa: true,
      },
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Pré II (Jardim II) A - Manhã",
        etapa: "pre_escola",
        turno: "manha",
        capacidade: 22,
        vagasDisponiveis: 22,
        anoLetivo: "2025",
        ativa: true,
      },
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Pré II (Jardim II) B - Tarde",
        etapa: "pre_escola",
        turno: "tarde",
        capacidade: 22,
        vagasDisponiveis: 22,
        anoLetivo: "2025",
        ativa: true,
      },
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "Pré II (Jardim II) - Integral",
        etapa: "pre_escola",
        turno: "integral",
        capacidade: 20,
        vagasDisponiveis: 20,
        anoLetivo: "2025",
        ativa: true,
      },
      // Fundamental
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "1º Ano - Manhã",
        etapa: "fundamental",
        turno: "manha",
        capacidade: 25,
        vagasDisponiveis: 25,
        anoLetivo: "2025",
        ativa: true,
      },
      {
        id: uuidv4(),
        idGlobal: uuidv4(),
        nome: "1º Ano - Tarde",
        etapa: "fundamental",
        turno: "tarde",
        capacidade: 25,
        vagasDisponiveis: 25,
        anoLetivo: "2025",
        ativa: true,
      },
    ];

    for (const turmaData of turmasAdicionais) {
      await db.insert(turma).values(turmaData);
    }

    console.log("✅ Turmas adicionais criadas com sucesso!");
    res.json({
      success: true,
      message: `${turmasAdicionais.length} turmas adicionais criadas com sucesso`,
      turmas: turmasAdicionais,
    });
  } catch (error) {
    console.error("❌ Erro ao criar turmas adicionais:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/assign-turmas-to-matriculas", async (req, res) => {
  try {
    console.log("🔗 Associando turmas às matrículas existentes...");

    // Buscar todas as matrículas sem turma
    const matriculasSemTurma = await db.execute(sql`
      SELECT m.id, m.aluno_id, a.etapa
      FROM matricula m
      JOIN aluno a ON m.aluno_id = a.id
      WHERE m.turma_id IS NULL
    `);

    console.log(
      `📋 Encontradas ${matriculasSemTurma.rows.length} matrículas sem turma`
    );

    // Buscar turmas disponíveis por etapa
    const turmas = await db.execute(sql`
      SELECT id, etapa, nome, vagas_disponiveis
      FROM turma
      WHERE ativa = true
      ORDER BY etapa, nome
    `);

    const turmasPorEtapa = {};
    turmas.rows.forEach((t) => {
      if (!turmasPorEtapa[t.etapa]) {
        turmasPorEtapa[t.etapa] = [];
      }
      turmasPorEtapa[t.etapa].push(t);
    });

    let atualizadas = 0;
    for (const matricula of matriculasSemTurma.rows) {
      const turmasDisponiveis = turmasPorEtapa[matricula.etapa] || [];
      if (turmasDisponiveis.length > 0) {
        // Pegar a primeira turma disponível para a etapa
        const turmaEscolhida = turmasDisponiveis[0];

        await db.execute(sql`
          UPDATE matricula 
          SET turma_id = ${turmaEscolhida.id}
          WHERE id = ${matricula.id}
        `);

        // Decrementar vagas disponíveis
        await db.execute(sql`
          UPDATE turma 
          SET vagas_disponiveis = vagas_disponiveis - 1
          WHERE id = ${turmaEscolhida.id}
        `);

        atualizadas++;
        console.log(
          `✅ Matrícula ${matricula.id} associada à turma ${turmaEscolhida.nome}`
        );
      }
    }

    console.log(`✅ ${atualizadas} matrículas atualizadas com turmas`);
    res.json({
      success: true,
      message: `${atualizadas} matrículas atualizadas com turmas`,
      atualizadas,
    });
  } catch (error) {
    console.error("❌ Erro ao associar turmas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/test-relatorio-matriculas", async (req, res) => {
  try {
    console.log("📊 Testando relatório de matrículas...");

    // Simular o mesmo query que o relatório usa
    const result = await db.execute(sql`
      SELECT 
        m.id,
        m.protocolo_local,
        m.status,
        m.data_matricula,
        m.observacoes,
        m.created_at,
        a.nome as aluno_nome,
        a.data_nascimento,
        a.etapa,
        a.necessidades_especiais,
        r.nome as responsavel_nome,
        r.cpf,
        r.telefone,
        r.email,
        t.nome as turma_nome,
        t.etapa as turma_etapa,
        t.turno
      FROM matricula m
      INNER JOIN aluno a ON m.aluno_id = a.id
      INNER JOIN responsavel r ON m.responsavel_id = r.id
      LEFT JOIN turma t ON m.turma_id = t.id
      ORDER BY m.created_at DESC
    `);

    console.log(
      `📋 Encontradas ${result.rows.length} matrículas para relatório`
    );
    res.json({
      success: true,
      count: result.rows.length,
      matriculas: result.rows,
    });
  } catch (error) {
    console.error("❌ Erro ao testar relatório:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/test-relatorio-gerar", async (req, res) => {
  try {
    console.log("📊 Testando geração de relatório sem autenticação...");

    const { tipo = "matriculas", formato = "csv" } = req.body;

    // Simular o mesmo query que o relatório usa
    const result = await db.execute(sql`
      SELECT 
        m.id,
        m.protocolo_local,
        m.status,
        m.data_matricula,
        m.observacoes,
        m.created_at,
        a.nome as aluno_nome,
        a.data_nascimento,
        a.etapa,
        a.necessidades_especiais,
        r.nome as responsavel_nome,
        r.cpf,
        r.telefone,
        r.email,
        t.nome as turma_nome,
        t.etapa as turma_etapa,
        t.turno
      FROM matricula m
      INNER JOIN aluno a ON m.aluno_id = a.id
      INNER JOIN responsavel r ON m.responsavel_id = r.id
      LEFT JOIN turma t ON m.turma_id = t.id
      ORDER BY m.created_at DESC
    `);

    console.log(
      `📋 Encontradas ${result.rows.length} matrículas para relatório`
    );

    if (formato === "csv") {
      // Gerar CSV simples
      const headers = [
        "ID",
        "Protocolo",
        "Status",
        "Data Matrícula",
        "Aluno",
        "Etapa",
        "Responsável",
        "CPF",
        "Telefone",
        "Email",
        "Turma",
        "Turno",
      ];

      const csvRows = [
        headers.join(","),
        ...result.rows.map((row) =>
          [
            row.id,
            row.protocolo_local,
            row.status,
            row.data_matricula || "",
            `"${row.aluno_nome}"`,
            row.etapa,
            `"${row.responsavel_nome}"`,
            row.cpf,
            row.telefone,
            row.email || "",
            `"${row.turma_nome || ""}"`,
            row.turno || "",
          ].join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");
      const buffer = Buffer.from(csvContent, "utf-8");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="relatorio_matriculas_${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`
      );
      res.send(buffer);
    } else {
      res.json({
        success: true,
        count: result.rows.length,
        matriculas: result.rows,
      });
    }
  } catch (error) {
    console.error("❌ Erro ao gerar relatório:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/test-relatorio-turmas", async (req, res) => {
  try {
    console.log("📊 Testando relatório por turmas...");

    const { search = "" } = req.query;

    // Buscar turmas com informações de matrículas
    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.nome,
        t.etapa,
        t.turno,
        t.capacidade,
        t.vagas_disponiveis,
        t.ano_letivo,
        t.ativa,
        COUNT(m.id) as total_matriculas,
        COUNT(CASE WHEN m.status = 'completo' THEN 1 END) as matriculas_completas,
        COUNT(CASE WHEN m.status = 'pre' THEN 1 END) as pre_matriculas
      FROM turma t
      LEFT JOIN matricula m ON t.id = m.turma_id
      WHERE t.ativa = true
        AND (${search} = '' OR t.nome ILIKE ${`%${search}%`})
      GROUP BY t.id, t.nome, t.etapa, t.turno, t.capacidade, t.vagas_disponiveis, t.ano_letivo, t.ativa
      ORDER BY t.nome
    `);

    console.log(`📋 Encontradas ${result.rows.length} turmas para relatório`);
    res.json({
      success: true,
      count: result.rows.length,
      turmas: result.rows,
    });
  } catch (error) {
    console.error("❌ Erro ao testar relatório de turmas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/test-relatorio-turmas-gerar", async (req, res) => {
  try {
    console.log("📊 Testando geração de relatório por turmas...");

    const { formato = "csv", search = "" } = req.body;

    // Buscar turmas com informações detalhadas de matrículas
    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.nome,
        t.etapa,
        t.turno,
        t.capacidade,
        t.vagas_disponiveis,
        t.ano_letivo,
        t.ativa,
        COUNT(m.id) as total_matriculas,
        COUNT(CASE WHEN m.status = 'completo' THEN 1 END) as matriculas_completas,
        COUNT(CASE WHEN m.status = 'pre' THEN 1 END) as pre_matriculas
      FROM turma t
      LEFT JOIN matricula m ON t.id = m.turma_id
      WHERE t.ativa = true
      GROUP BY t.id, t.nome, t.etapa, t.turno, t.capacidade, t.vagas_disponiveis, t.ano_letivo, t.ativa
      ORDER BY t.nome
    `);

    console.log(`📋 Encontradas ${result.rows.length} turmas para relatório`);

    if (formato === "csv") {
      // Gerar CSV para turmas
      const headers = [
        "Nome da Turma",
        "Etapa",
        "Turno",
        "Capacidade",
        "Vagas Disponíveis",
        "Total Matrículas",
        "Matrículas Completas",
        "Pré-Matrículas",
        "Percentual Ocupação",
        "Ano Letivo",
        "Status",
      ];

      const csvRows = [
        headers.join(","),
        ...result.rows.map((row) => {
          const percentualOcupacao =
            row.capacidade > 0
              ? Math.round(
                  (row.matriculas_completas / row.capacidade) * 100 * 100
                ) / 100
              : 0;

          return [
            `"${row.nome}"`,
            row.etapa,
            row.turno,
            row.capacidade,
            row.vagas_disponiveis,
            row.total_matriculas,
            row.matriculas_completas,
            row.pre_matriculas,
            `${percentualOcupacao}%`,
            row.ano_letivo,
            row.ativa ? "Ativa" : "Inativa",
          ].join(",");
        }),
      ];

      const csvContent = csvRows.join("\n");
      const buffer = Buffer.from(csvContent, "utf-8");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="relatorio_turmas_${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`
      );
      res.send(buffer);
    } else {
      res.json({
        success: true,
        count: result.rows.length,
        turmas: result.rows,
      });
    }
  } catch (error) {
    console.error("❌ Erro ao gerar relatório de turmas:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

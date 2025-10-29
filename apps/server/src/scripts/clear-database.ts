import { db } from "../../config/database.config.js";
import { sql } from "drizzle-orm";

/**
 * Script para limpar completamente o banco de dados
 * 
 * Uso:
 *   bun run apps/server/src/scripts/clear-database.ts
 *   ou
 *   tsx apps/server/src/scripts/clear-database.ts
 */
async function clearDatabase() {
  try {
    console.log("🧹 Limpando banco de dados completamente...");
    console.log("=====================================");
    console.log("⚠️  ATENÇÃO: Esta ação é IRREVERSÍVEL!");
    console.log("");

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
    
    // 5. User por último (se quiser limpar usuários também, descomente)
    // NOTA: Manter pelo menos um usuário admin é recomendado
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
    console.log("   3. Para criar admin: bun run apps/server/src/scripts/seed-admin.ts");
    console.log("");

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Erro ao limpar banco:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

clearDatabase();


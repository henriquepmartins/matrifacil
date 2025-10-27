import { getRedisClient } from "../src/config/redis.config.js";

async function testRedisConnection() {
  console.log("🧪 Testando conexão com Redis...\n");

  try {
    const redis = getRedisClient();

    if (!redis) {
      console.log("❌ Redis não configurado (REDIS_URL não definida)");
      console.log("\n📝 Para configurar:");
      console.log("   1. Adicione REDIS_URL no arquivo apps/server/.env");
      console.log("   2. Ou configure no Railway");
      return;
    }

    // Teste de PING
    const pingResult = await redis.ping();
    console.log(`✅ PING: ${pingResult}`);

    // Teste de escrita
    await redis.set("test:connection", "success", "EX", 60);
    console.log("✅ SET: Chave escrita com sucesso");

    // Teste de leitura
    const value = await redis.get("test:connection");
    console.log(`✅ GET: Valor lido: ${value}`);

    // Teste de incremento
    await redis.incr("test:counter");
    const counter = await redis.get("test:counter");
    console.log(`✅ INCR: Contador: ${counter}`);

    // Teste de TTL
    const ttl = await redis.ttl("test:connection");
    console.log(`✅ TTL: Restam ${ttl} segundos`);

    // Limpar teste
    await redis.del("test:connection", "test:counter");
    console.log("✅ DEL: Chaves de teste removidas");

    // Informações do Redis
    const info = await redis.info("server");
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    const version = versionMatch ? versionMatch[1] : "unknown";
    console.log(`\n📊 Redis Version: ${version}`);

    console.log("\n✅ ✅ ✅ Todas as operações funcionaram!");
    console.log("🚀 Redis está pronto para uso!\n");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Erro ao conectar ao Redis:");
    console.error(error.message);
    console.error("\n💡 Verifique:");
    console.error("   1. REDIS_URL está correta");
    console.error("   2. Redis está rodando");
    console.error("   3. Porta está correta");
    console.error("   4. Senha está correta (se aplicável)\n");
    process.exit(1);
  }
}

testRedisConnection();

import Redis from "ioredis";

async function testRedisConnection() {
  console.log("🧪 Testando conexão com Redis...\n");

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  try {
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on("error", (err) => {
      console.error("❌ Erro no Redis:", err.message);
    });

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

    await redis.quit();
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Erro ao conectar ao Redis:");
    console.error(error.message);
    console.error("\n💡 Para configurar Redis localmente:");
    console.error("   brew install redis");
    console.error("   brew services start redis");
    console.error(`\n🔗 URL testada: ${redisUrl}\n`);
    process.exit(1);
  }
}

testRedisConnection();

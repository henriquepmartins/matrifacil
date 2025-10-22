import { db } from "@matrifacil-/db/index.js";
import { user, account } from "@matrifacil-/db/schema/auth.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

async function seedAdmin() {
  console.log("🌱 Iniciando seed do usuário admin...");

  try {
    // Verificar se o usuário admin já existe
    const existingAdmin = await db
      .select()
      .from(user)
      .where(eq(user.email, "admin@gmail.com"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("✅ Usuário admin já existe:", existingAdmin[0]);
      return;
    }

    // Criar o usuário admin
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash("senha123", 10);

    // Inserir usuário
    const [newUser] = await db
      .insert(user)
      .values({
        id: adminId,
        name: "Administrador",
        email: "admin@gmail.com",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Inserir conta com senha
    await db.insert(account).values({
      id: `${adminId}-password`,
      accountId: adminId,
      providerId: "credential",
      userId: adminId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("✅ Usuário admin criado com sucesso!");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔑 Senha: senha123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar usuário admin:", error);
    process.exit(1);
  }
}

seedAdmin();

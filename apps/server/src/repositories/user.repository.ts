import { db } from "../config/database.config.js";
import { user, session, account } from "@matrifacil-/db/schema/auth";
import { eq, and } from "drizzle-orm";

export interface CreateUserData {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface CreateSessionData {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class UserRepository {
  /**
   * Cria um novo usuário no banco de dados
   */
  async createUser(data: CreateUserData) {
    const [newUser] = await db
      .insert(user)
      .values({
        id: data.id,
        name: data.name,
        email: data.email,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Cria a conta com a senha
    await db.insert(account).values({
      id: `${data.id}-password`,
      accountId: data.id,
      providerId: "credential",
      userId: data.id,
      password: data.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newUser;
  }

  /**
   * Busca um usuário por email
   */
  async findUserByEmail(email: string) {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return foundUser;
  }

  /**
   * Busca um usuário por ID
   */
  async findUserById(id: string) {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    return foundUser;
  }

  /**
   * Busca a senha do usuário
   */
  async findUserPassword(userId: string) {
    const [userAccount] = await db
      .select()
      .from(account)
      .where(
        and(eq(account.userId, userId), eq(account.providerId, "credential"))
      )
      .limit(1);

    return userAccount?.password;
  }

  /**
   * Cria uma nova sessão
   */
  async createSession(data: CreateSessionData) {
    const [newSession] = await db
      .insert(session)
      .values({
        id: data.id,
        userId: data.userId,
        token: data.token,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newSession;
  }

  /**
   * Busca uma sessão por token
   */
  async findSessionByToken(token: string) {
    const [foundSession] = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    return foundSession;
  }

  /**
   * Deleta uma sessão
   */
  async deleteSession(sessionId: string) {
    await db.delete(session).where(eq(session.id, sessionId));
  }

  /**
   * Deleta sessões expiradas
   */
  async deleteExpiredSessions() {
    const now = new Date();
    await db.delete(session).where(eq(session.expiresAt, now));
  }

  /**
   * Atualiza o último acesso do usuário
   */
  async updateUserLastAccess(userId: string) {
    await db
      .update(user)
      .set({ updatedAt: new Date() })
      .where(eq(user.id, userId));
  }
}

export const userRepository = new UserRepository();

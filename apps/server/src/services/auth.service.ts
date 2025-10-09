import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../middlewares/error.middleware.js";
import { env } from "../config/env.js";

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SessionInfo {
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly SESSION_EXPIRY_DAYS = 7;

  /**
   * Registra um novo usuário
   */
  async signUp(data: SignUpData, sessionInfo?: SessionInfo) {
    // Verifica se o email já existe
    const existingUser = await userRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError(400, "Email já cadastrado");
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Cria o usuário
    const userId = this.generateId();
    const user = await userRepository.createUser({
      id: userId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Cria a sessão
    const sessionData = await this.createSessionForUser(user.id, sessionInfo);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      session: sessionData,
    };
  }

  /**
   * Autentica um usuário
   */
  async signIn(data: SignInData, sessionInfo?: SessionInfo) {
    // Busca o usuário
    const user = await userRepository.findUserByEmail(data.email);
    if (!user) {
      throw new AppError(401, "Email ou senha inválidos");
    }

    // Busca a senha
    const hashedPassword = await userRepository.findUserPassword(user.id);
    if (!hashedPassword) {
      throw new AppError(401, "Email ou senha inválidos");
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(data.password, hashedPassword);
    if (!isPasswordValid) {
      throw new AppError(401, "Email ou senha inválidos");
    }

    // Atualiza último acesso
    await userRepository.updateUserLastAccess(user.id);

    // Cria a sessão
    const sessionData = await this.createSessionForUser(user.id, sessionInfo);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      session: sessionData,
    };
  }

  /**
   * Invalida uma sessão (logout)
   */
  async signOut(sessionId: string) {
    await userRepository.deleteSession(sessionId);
  }

  /**
   * Obtém informações da sessão atual
   */
  async getSession(token: string) {
    const session = await userRepository.findSessionByToken(token);

    if (!session) {
      throw new AppError(401, "Sessão inválida");
    }

    // Verifica se a sessão expirou
    if (session.expiresAt < new Date()) {
      await userRepository.deleteSession(session.id);
      throw new AppError(401, "Sessão expirada");
    }

    // Busca o usuário
    const user = await userRepository.findUserById(session.userId);
    if (!user) {
      throw new AppError(401, "Usuário não encontrado");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  /**
   * Cria uma nova sessão para um usuário
   */
  private async createSessionForUser(
    userId: string,
    sessionInfo?: SessionInfo
  ) {
    const sessionId = this.generateId();
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS);

    const session = await userRepository.createSession({
      id: sessionId,
      userId,
      token,
      expiresAt,
      ipAddress: sessionInfo?.ipAddress,
      userAgent: sessionInfo?.userAgent,
    });

    // Busca o usuário para incluir no JWT
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw new AppError(500, "Erro ao criar sessão");
    }

    // Gera o JWT
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        sessionId: session.id,
      },
      env.JWT_SECRET,
      { expiresIn: `${this.SESSION_EXPIRY_DAYS}d` }
    );

    return {
      id: session.id,
      token: jwtToken,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Gera um ID único
   */
  private generateId(): string {
    return randomBytes(16).toString("hex");
  }

  /**
   * Gera um token único
   */
  private generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  /**
   * Limpa sessões expiradas (pode ser chamado periodicamente)
   */
  async cleanExpiredSessions() {
    await userRepository.deleteExpiredSessions();
  }
}

export const authService = new AuthService();

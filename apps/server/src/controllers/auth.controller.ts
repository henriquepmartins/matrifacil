import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service.js";
import { AppError } from "../middlewares/error.middleware.js";

const signUpSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export class AuthController {
  /**
   * Registra um novo usuário
   * POST /api/auth/signup
   */
  async signUp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = signUpSchema.parse(req.body);

      const sessionInfo = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await authService.signUp(data, sessionInfo);

      // Define o cookie com o token
      res.cookie("token", result.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        data: {
          user: result.user,
          token: result.session.token,
          expiresAt: result.session.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Autentica um usuário
   * POST /api/auth/login
   */
  async signIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = signInSchema.parse(req.body);

      const sessionInfo = {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      };

      const result = await authService.signIn(data, sessionInfo);

      // Define o cookie com o token
      res.cookie("token", result.session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: {
          user: result.user,
          token: result.session.token,
          expiresAt: result.session.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Desautentica um usuário
   * POST /api/auth/logout
   */
  async signOut(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.sessionId) {
        throw new AppError(401, "Não autenticado");
      }

      await authService.signOut(req.sessionId);

      // Remove o cookie
      res.clearCookie("token");

      res.status(200).json({
        success: true,
        message: "Logout realizado com sucesso",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém a sessão atual
   * GET /api/auth/session
   */
  async getSession(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token =
        req.cookies?.token || req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new AppError(401, "Token não fornecido");
      }

      const result = await authService.getSession(token);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtém informações do usuário autenticado
   * GET /api/auth/me
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(401, "Não autenticado");
      }

      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

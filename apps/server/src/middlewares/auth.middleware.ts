import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./error.middleware.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  sessionId: string;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Verifica token no header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      // Verifica também nos cookies
      const cookieToken = req.cookies?.token;
      if (!cookieToken) {
        throw new AppError(401, "Token não fornecido");
      }
    }

    const actualToken = token || req.cookies?.token;

    // Verifica e decodifica o token
    const decoded = jwt.verify(actualToken, env.JWT_SECRET) as JWTPayload;

    // Adiciona informações do usuário na requisição
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
    req.sessionId = decoded.sessionId;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, "Token inválido"));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, "Token expirado"));
    } else {
      next(error);
    }
  }
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const cookieToken = req.cookies?.token;
    const actualToken = token || cookieToken;

    if (actualToken) {
      const decoded = jwt.verify(actualToken, env.JWT_SECRET) as JWTPayload;
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      };
      req.sessionId = decoded.sessionId;
    }
    next();
  } catch (error) {
    // Ignora erros para autenticação opcional
    next();
  }
}

import type { Request, Response, NextFunction } from "@types/express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.config.js";
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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      const cookieToken = req.cookies?.token;
      if (!cookieToken) {
        throw new AppError(401, "Token não fornecido");
      }
    }

    const actualToken = token || req.cookies?.token;

    const decoded = jwt.verify(actualToken, env.JWT_SECRET) as JWTPayload;

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
    next();
  }
}

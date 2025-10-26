import type { Request, Response, NextFunction } from "@types/express";
import { checkDatabaseConnection } from "../config/database.config.js";

export class HealthController {
  /**
   * Health check endpoint
   * Verifica se o servidor está rodando e se o banco de dados está acessível
   */
  async check(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startTime = Date.now();

      // Verifica conexão com o banco de dados
      const isDatabaseHealthy = await checkDatabaseConnection();

      const responseTime = Date.now() - startTime;

      if (!isDatabaseHealthy) {
        res.status(503).json({
          success: false,
          message: "Service Unavailable",
          status: "unhealthy",
          checks: {
            database: "down",
            server: "up",
          },
          timestamp: new Date().toISOString(),
          responseTime: `${responseTime}ms`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "OK",
        status: "healthy",
        checks: {
          database: "up",
          server: "up",
        },
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Readiness check - verifica se o servidor está pronto para receber requisições
   */
  async readiness(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isDatabaseHealthy = await checkDatabaseConnection();

      if (!isDatabaseHealthy) {
        res.status(503).json({
          success: false,
          message: "Not Ready",
          ready: false,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Ready",
        ready: true,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Liveness check - verifica se o servidor está vivo
   */
  async liveness(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: "Alive",
      alive: true,
    });
  }
}

export const healthController = new HealthController();

import { Request, Response } from "express";
import { GetDashboardStatsUseCase } from "../../application/use-cases/get-dashboard-stats.use-case";
import { container } from "../../infrastructure/config/container.config";

export class DashboardController {
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const useCase = container.get<GetDashboardStatsUseCase>(
        "getDashboardStatsUseCase"
      );
      const stats = await useCase.execute();

      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas do dashboard:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}

export const dashboardController = new DashboardController();

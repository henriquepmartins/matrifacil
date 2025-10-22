import { Router } from "express";
import { container } from "../infrastructure/config/container.config.js";
import { MatriculaController } from "../adapters/web/matricula.controller.js";
import { DashboardController } from "../adapters/web/dashboard.controller.js";
import {
  buscarAlunos,
  deleteMatricula,
  getTurmas,
} from "../controllers/dashboard.controller.js";

const router = Router();
const matriculaController = container.get<MatriculaController>(
  "matriculaController"
);
const dashboardController = container.get<DashboardController>(
  "dashboardController"
);

// Dashboard stats
router.get(
  "/api/dashboard/stats",
  dashboardController.getStats.bind(dashboardController)
);

// Matrículas - usando controllers domain-driven
router.get(
  "/api/matriculas",
  matriculaController.getMatriculas.bind(matriculaController)
);
router.get(
  "/api/pre-matriculas",
  matriculaController.getMatriculas.bind(matriculaController)
);
router.post(
  "/api/pre-matriculas",
  matriculaController.createPreMatricula.bind(matriculaController)
);
router.post(
  "/api/pre-matriculas/:id/converter",
  matriculaController.convertToMatriculaCompleta.bind(matriculaController)
);
router.post(
  "/api/matriculas/:id/approve",
  matriculaController.approveMatricula.bind(matriculaController)
);

// Rotas auxiliares (mantendo do dashboard.controller.ts por enquanto)
router.delete("/api/matriculas/:id", deleteMatricula);
router.get("/api/matriculas/buscar-alunos", buscarAlunos);
router.get("/api/turmas", getTurmas);

export default router;

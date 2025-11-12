import { Router } from "express";
import { container } from "../infrastructure/config/container.config.js";
import { MatriculaController } from "../adapters/web/matricula.controller.js";
import { DashboardController } from "../adapters/web/dashboard.controller.js";
import {
  buscarAlunos,
  deleteMatricula,
  updateMatricula,
  getTurmas,
  getTurmaDetalhes,
  transferirAluno,
  getPreMatriculaById,
} from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();
const matriculaController = container.get<MatriculaController>(
  "matriculaController"
);
const dashboardController = container.get<DashboardController>(
  "dashboardController"
);

// Todas as rotas do dashboard requerem autenticação
router.use(authenticateToken);

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
router.get(
  "/api/pre-matriculas/:id",
  getPreMatriculaById
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
router.put("/api/matriculas/:id", updateMatricula);
router.delete("/api/matriculas/:id", deleteMatricula);
router.get("/api/matriculas/buscar-alunos", buscarAlunos);

// Turmas
router.get("/api/turmas", getTurmas);
router.get("/api/turmas/:id/detalhes", getTurmaDetalhes);
router.post("/api/turmas/transferir-aluno", transferirAluno);

export default router;

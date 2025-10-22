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

router.get(
  "/api/dashboard/stats",
  dashboardController.getStats.bind(dashboardController)
);

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

// Rota para deletar matrícula
router.delete("/api/matriculas/:id", deleteMatricula);

// Rota para buscar alunos (autocomplete)
router.get("/api/matriculas/buscar-alunos", buscarAlunos);

// Rota para buscar turmas
router.get("/api/turmas", getTurmas);

export default router;

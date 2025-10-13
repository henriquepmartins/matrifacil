import { Router } from "express";
import {
  getDashboardStats,
  getMatriculasRecentes,
  getMatriculas,
  getPreMatriculas,
  createPreMatricula,
  getPreMatriculaById,
  updatePreMatricula,
  deletePreMatricula,
  convertPreMatricula,
  getTurmas,
} from "../controllers/dashboard.controller.js";

const router = Router();

// Dashboard stats
router.get("/api/dashboard/stats", getDashboardStats);

// Matrículas
router.get("/api/matriculas", getMatriculas);
router.get("/api/matriculas/recentes", getMatriculasRecentes);

// Pré-matrículas
router.get("/api/pre-matriculas", getPreMatriculas);
router.post("/api/pre-matriculas", createPreMatricula);
router.get("/api/pre-matriculas/:id", getPreMatriculaById);
router.put("/api/pre-matriculas/:id", updatePreMatricula);
router.delete("/api/pre-matriculas/:id", deletePreMatricula);
router.post("/api/pre-matriculas/:id/converter", convertPreMatricula);

// Turmas
router.get("/api/turmas", getTurmas);

export default router;

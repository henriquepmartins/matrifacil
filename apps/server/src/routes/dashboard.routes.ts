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
  createMatriculaFromPre,
  getTurmas,
  updateMatriculasWithTurmas,
  updateMatricula,
  deleteMatricula,
} from "../controllers/dashboard.controller.js";

const router = Router();

// Dashboard stats
router.get("/api/dashboard/stats", getDashboardStats);

// Matrículas
router.get("/api/matriculas", getMatriculas);
router.get("/api/matriculas/recentes", getMatriculasRecentes);
router.put("/api/matriculas/:id", updateMatricula);
router.delete("/api/matriculas/:id", deleteMatricula);

// Pré-matrículas
router.get("/api/pre-matriculas", getPreMatriculas);
router.post("/api/pre-matriculas", createPreMatricula);
router.get("/api/pre-matriculas/:id", getPreMatriculaById);
router.put("/api/pre-matriculas/:id", updatePreMatricula);
router.delete("/api/pre-matriculas/:id", deletePreMatricula);
router.post("/api/pre-matriculas/:id/converter", convertPreMatricula);
router.post("/api/matriculas/from-pre/:id", createMatriculaFromPre);

// Turmas
router.get("/api/turmas", getTurmas);

// Atualizar matrículas com turmas
router.post("/api/matriculas/update-turmas", updateMatriculasWithTurmas);

export default router;

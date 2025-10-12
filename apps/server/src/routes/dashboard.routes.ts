import { Router } from "express";
import {
  getDashboardStats,
  getMatriculasRecentes,
  getMatriculas,
  getPreMatriculas,
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

// Turmas
router.get("/api/turmas", getTurmas);

export default router;

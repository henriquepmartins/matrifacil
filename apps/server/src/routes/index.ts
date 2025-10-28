import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import relatorioRoutes from "./relatorio.routes.js";
import testRoutes from "./test.routes.js";
import docsRoutes from "./docs.routes.js";
import syncRoutes from "./sync.routes.js";

const router = Router();

// API Documentation
router.use("/docs", docsRoutes);

// Health check routes
router.use("/health", healthRoutes);

// Auth routes
router.use("/api/auth", authRoutes);

// Sync routes
router.use("/api/sync", syncRoutes);

// Dashboard routes
router.use("/", dashboardRoutes);

// Relatório routes
router.use("/api/relatorios", relatorioRoutes);

// Test routes
router.use("/api/test", testRoutes);

export default router;

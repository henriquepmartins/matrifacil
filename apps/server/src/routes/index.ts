import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

// Health check routes
router.use("/health", healthRoutes);

// Auth routes
router.use("/api/auth", authRoutes);

// Dashboard routes
router.use("/", dashboardRoutes);

export default router;

import { Router } from "express";
import { healthController } from "../controllers/health.controller.js";

const router = Router();

/**
 * GET /health - Health check completo
 */
router.get("/", (req, res, next) => healthController.check(req, res, next));

/**
 * GET /health/readiness - Readiness probe
 */
router.get("/readiness", (req, res, next) =>
  healthController.readiness(req, res, next)
);

/**
 * GET /health/liveness - Liveness probe
 */
router.get("/liveness", (req, res, next) =>
  healthController.liveness(req, res, next)
);

export default router;

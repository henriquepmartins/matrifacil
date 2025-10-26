import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * POST /api/auth/signup - Registrar novo usuário
 */
router.post("/signup", (req, res, next) =>
  authController.signUp(req, res, next)
);

/**
 * POST /api/auth/login - Autenticar usuário
 */
router.post("/login", (req, res, next) =>
  authController.signIn(req, res, next)
);

/**
 * POST /api/auth/logout - Desautenticar usuário (requer autenticação)
 */
router.post("/logout", authenticateToken, (req, res, next) =>
  authController.signOut(req, res, next)
);

/**
 * GET /api/auth/session - Obter sessão atual
 */
router.get("/session", (req, res, next) =>
  authController.getSession(req, res, next)
);

/**
 * GET /api/auth/me - Obter informações do usuário autenticado
 */
router.get("/me", authenticateToken, (req, res, next) =>
  authController.getMe(req, res, next)
);

export default router;

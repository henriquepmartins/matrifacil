import { Router } from "express";
import { container } from "../infrastructure/config/container.config.js";
import { RelatorioController } from "../adapters/web/relatorio.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Obter controller do DI container
const relatorioController = container.get<RelatorioController>(
  "relatorioController"
);

// POST /api/relatorios/gerar - Gerar novo relatório
router.post("/gerar", async (req, res) => {
  await relatorioController.gerarRelatorio(req, res);
});

// GET /api/relatorios/historico - Listar relatórios gerados
router.get("/historico", async (req, res) => {
  await relatorioController.listarRelatorios(req, res);
});

export default router;

import { Router } from "express";
import { syncController } from "../controllers/sync.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { uploadDocumentMiddleware } from "../middlewares/upload.middleware.js";

const router = Router();

// Todas as rotas de sincronização precisam de autenticação
router.use(authenticateToken);

// POST /api/sync - Sincronização em lote
router.post("/", (req, res, next) => {
  syncController.sync(req, res, next);
});

// GET /api/sync/status/:batchId - Status de um lote
router.get("/status/:batchId", (req, res, next) => {
  syncController.getSyncStatus(req, res, next);
});

// GET /api/sync/changes - Pull de mudanças
router.get("/changes", (req, res, next) => {
  syncController.getChanges(req, res, next);
});

// POST /api/sync/upload - Upload de documentos
router.post("/upload", uploadDocumentMiddleware, (req, res, next) => {
  syncController.uploadDocument(req, res, next);
});

export default router;

import { Router } from "express";
import { container } from "../infrastructure/config/container.config.js";
import { MatriculaController } from "../adapters/web/matricula.controller.js";

const router = Router();
const matriculaController = container.get<MatriculaController>(
  "matriculaController"
);

router.get("/api/dashboard/stats", (req, res) => {
  res.json({
    success: true,
    data: {
      totalMatriculas: 156,
      preMatriculas: 23,
      documentosPendentes: 8,
      vagasDisponiveis: 12,
    },
  });
});

router.get(
  "/api/matriculas",
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

export default router;

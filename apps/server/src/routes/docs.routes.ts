import { Router } from "express";
import { apiReference } from "@scalar/express-api-reference";
import { openApiSpec } from "../config/openapi.spec.js";

const router = Router();

/**
 * GET /docs/openapi.json - Especificação OpenAPI em formato JSON
 */
router.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

/**
 * GET /docs - Documentação interativa da API usando Scalar UI
 */
router.get(
  "/",
  apiReference({
    theme: "purple",
    layout: "modern",
    darkMode: true,
    showSidebar: true,
    metaData: {
      title: "MatriFácil API Documentation",
      description: "Documentação completa e interativa da API MatriFácil",
      ogDescription: "API para gerenciamento de matrículas escolares",
      ogTitle: "MatriFácil API",
    },
    searchHotKey: "k",
    hiddenClients: [],
    customCss: `
      .scalar-api-client {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
      .scalar-card {
        border-radius: 8px;
      }
      .scalar-api-reference {
        --scalar-background-1: #1a1a1a;
        --scalar-background-2: #2a2a2a;
        --scalar-background-3: #3a3a3a;
      }
    `,
    content: openApiSpec,
  })
);

export default router;
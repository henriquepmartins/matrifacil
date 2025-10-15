import express from "express";
import type { Application } from "express";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

/**
 * Configura e retorna a aplicação Express
 */
export function createApp(): Application {
  const app = express();

  // Middlewares globais
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request logging (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    app.use((req, _res, next) => {
      void _res;
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // Rotas
  app.use(routes);

  // Handler para rotas não encontradas
  app.use(notFoundHandler);

  // Handler de erros (deve ser o último middleware)
  app.use(errorHandler);

  return app;
}

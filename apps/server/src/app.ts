import express from "express";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./middlewares/cors.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (process.env.NODE_ENV === "development") {
    app.use((req, _res, next) => {
      void _res;
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  app.use(routes);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}

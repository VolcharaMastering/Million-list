import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi";
import { itemsRouter } from "./routes/items.routes";
import { notFoundMiddleware } from "./middleware/not-found-middleware";
import { errorMiddleware } from "./middleware/error-middleware";

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());

  app.get("/api-docs.json", (_req, res) => {
    res.json(openApiSpec);
  });
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/items", itemsRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

import cors from "cors";
import express from "express";
import { itemsRouter } from "./routes/items.routes";
import { notFoundMiddleware } from "./middleware/not-found-middleware";
import { errorMiddleware } from "./middleware/error-middleware";

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/items", itemsRouter);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

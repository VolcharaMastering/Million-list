import type { RequestHandler } from "express";

export const notFoundMiddleware: RequestHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: "not_found",
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
};


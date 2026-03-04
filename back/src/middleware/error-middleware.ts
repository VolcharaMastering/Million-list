import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "bad_request",
        message: "Invalid request",
        details: err.issues,
      },
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      error: {
        code: "internal_error",
        message: err.message,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: "internal_error",
      message: "Unknown error",
    },
  });
};


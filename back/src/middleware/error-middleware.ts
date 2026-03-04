import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { BadRequestError, ItemExistsError } from "../errors";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof BadRequestError) {
    res.status(400).json({
      error: {
        code: "bad_request",
        message: err.message,
        ...err.details,
      },
    });
    return;
  }

  if (err instanceof ItemExistsError) {
    res.status(409).json({
      error: {
        code: "conflict",
        message: err.message,
      },
    });
    return;
  }

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


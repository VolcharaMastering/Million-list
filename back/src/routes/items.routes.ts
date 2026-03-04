import { Router } from "express";
import { z } from "zod";
import { itemsService } from "../services/items-service";

const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const itemsRouter = Router();

itemsRouter.get("/", async (req, res, next) => {
  try {
    const query = paginationQuerySchema.parse(req.query);
    const page = await itemsService.getItemsPage(query);
    res.json(page);
  } catch (err) {
    next(err);
  }
});


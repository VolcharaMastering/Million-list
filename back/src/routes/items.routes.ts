import { Router } from "express";
import { z } from "zod";
import { itemsService } from "../services/items-service";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().max(50).optional(),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

export const itemsRouter = Router();

itemsRouter.get("/", async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const page = await itemsService.getItemsPage(query);
    res.json(page);
  } catch (err) {
    next(err);
  }
});

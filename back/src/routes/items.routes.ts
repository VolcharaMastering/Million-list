import { Router } from "express";
import { z } from "zod";
import { BadRequestError } from "../errors";
import { itemsService } from "../services/items-service";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().max(50).optional(),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

const MAX_IDS = 1000;

// Split array into valid integer ids (>= 1) and invalid elements.
const splitValidAndInvalid = (
  arr: unknown[]
): { validIds: number[]; invalid: unknown[] } => {
  const validIds: number[] = [];
  const invalid: unknown[] = [];
  for (const item of arr) {
    const n = Number(item);
    if (Number.isInteger(n) && n >= 1) {
      validIds.push(n);
    } else {
      invalid.push(item);
    }
  }
  return { validIds, invalid };
};

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

itemsRouter.post("/", async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) {
      next(new BadRequestError("Body must be an array"));
      return;
    }
    if (req.body.length > MAX_IDS) {
      next(
        new BadRequestError(`Array length must be at most ${MAX_IDS}`)
      );
      return;
    }
    const { validIds, invalid } = splitValidAndInvalid(req.body);
    if (validIds.length === 0) {
      next(
        new BadRequestError("No valid ids to add", {
          invalid: invalid.length > 0 ? invalid : undefined,
        })
      );
      return;
    }
    const result = await itemsService.addItems(validIds);
    if (result.added.length === 0) {
      next(
        new BadRequestError("No items added: all ids already exist", {
          alreadyExists: result.alreadyExists,
          invalid: invalid.length > 0 ? invalid : undefined,
        })
      );
      return;
    }
    res.status(201).json({
      added: result.added,
      alreadyExists: result.alreadyExists,
      ...(invalid.length > 0 ? { invalid } : {}),
    });
  } catch (err) {
    next(err);
  }
});

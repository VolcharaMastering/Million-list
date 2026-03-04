import { Router } from "express";
import { z } from "zod";
import { BadRequestError } from "../errors";
import { itemsService } from "../services/items-service";
import { selectionStore } from "../services/selection-store";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().max(50).optional(),
  sort: z.enum(["asc", "desc"]).default("asc"),
});

const MAX_IDS = 1000;

const selectedListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().max(50).optional(),
});

const selectedIdsBodySchema = z.object({
  ids: z.array(z.coerce.number().int().min(1)).min(1).max(MAX_IDS),
});

const reorderBodySchema = z.object({
  orderedIds: z.array(z.coerce.number().int().min(1)).min(1).max(MAX_IDS),
});

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

// Left panel: all items except selected, with pagination/search/sort.
itemsRouter.get("/", async (req, res, next) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const excludeIds = selectionStore.getSet();
    const page = await itemsService.getItemsPage({
      ...query,
      excludeIds: excludeIds.size > 0 ? excludeIds : undefined,
    });
    res.json(page);
  } catch (err) {
    next(err);
  }
});

// Full selected ids in order (e.g. for restore on page refresh).
itemsRouter.get("/selected/order", (_req, res) => {
  res.json({ orderedIds: selectionStore.getIds() });
});

// Right panel: selected items in user order, with pagination/search.
itemsRouter.get("/selected", async (req, res, next) => {
  try {
    const query = selectedListQuerySchema.parse(req.query);
    const page = itemsService.getSelectedPage(query);
    res.json(page);
  } catch (err) {
    next(err);
  }
});

itemsRouter.post("/selected", async (req, res, next) => {
  try {
    const body = selectedIdsBodySchema.parse(req.body);
    const added = selectionStore.add(body.ids);
    res.status(201).json({ added });
  } catch (err) {
    next(err);
  }
});

itemsRouter.delete("/selected", async (req, res, next) => {
  try {
    const body = selectedIdsBodySchema.parse(req.body);
    selectionStore.remove(body.ids);
    res.status(200).json({ removed: body.ids });
  } catch (err) {
    next(err);
  }
});

itemsRouter.patch("/selected", async (req, res, next) => {
  try {
    const body = reorderBodySchema.parse(req.body);
    selectionStore.setOrder(body.orderedIds);
    res.status(200).json({ orderedIds: selectionStore.getIds() });
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

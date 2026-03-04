import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Returns one page of items with total count. Supports search and sort.
const getItemsPage = async ({
  limit,
  offset,
  search,
  sort,
}: ListItemsInput): Promise<ItemsPage> => {
  // Order direction for SQL (ASC or DESC).
  const order = sort === "desc" ? "DESC" : "ASC";

  if (search !== undefined && search.trim() !== "") {
    // Match id as text with LIKE pattern.
    const pattern = `%${search.trim()}%`;
    const [items, countResult] = await Promise.all([
      prisma.$queryRaw<Row[]>`
        SELECT id FROM items
        WHERE id::text LIKE ${pattern}
        ORDER BY id ${Prisma.raw(order)}
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint AS count FROM items
        WHERE id::text LIKE ${pattern}
      `,
    ]);
    // Convert bigint to number for JSON.
    const total = Number(countResult[0]?.count ?? 0);
    return {
      total,
      limit,
      offset,
      items: items.map((row) => ({ id: Number(row.id) })),
    };
  }

  // No search: load page and total count with Prisma.
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      orderBy: { id: sort },
      take: limit,
      skip: offset,
    }),
    prisma.item.count(),
  ]);

  return {
    total,
    limit,
    offset,
    items: items.map((row) => ({ id: Number(row.id) })),
  };
};

// Adds many ids to the table. Returns added ids and those that already existed.
// Client must batch requests every 10s and send an array of ids.
const addItems = async (ids: number[]): Promise<AddItemsResult> => {
  const uniqueIds = [...new Set(ids)];
  if (uniqueIds.length === 0) {
    return { added: [], alreadyExists: [] };
  }
  const existingRows = await prisma.item.findMany({
    where: { id: { in: uniqueIds.map((id) => BigInt(id)) } },
    select: { id: true },
  });
  const existingSet = new Set(existingRows.map((r) => Number(r.id)));
  const toInsert = uniqueIds.filter((id) => !existingSet.has(id));
  if (toInsert.length > 0) {
    await prisma.item.createMany({
      data: toInsert.map((id) => ({ id: BigInt(id) })),
      skipDuplicates: true,
    });
  }
  const alreadyExists = uniqueIds.filter((id) => existingSet.has(id));
  return { added: toInsert, alreadyExists };
};

export const itemsService = {
  getItemsPage,
  addItems,
};

import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Return of page of items with total count, optional search and sort.
const getItemsPage = async ({
  limit,
  offset,
  search,
  sort,
}: ListItemsInput): Promise<ItemsPage> => {
  // SQL ORDER BY
  const order = sort === "desc" ? "DESC" : "ASC";

  if (search !== undefined && search.trim() !== "") {
    // Filter by id containing search substring (id => to text).
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
    const total = Number(countResult[0]?.count ?? 0);
    return {
      total,
      limit,
      offset,
      items: items.map((row) => ({ id: Number(row.id) })),
    };
  }

  // No search: use Prisma findMany and count with default limit = 20. To prevent millions of returned elements
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

export const itemsService = {
  getItemsPage,
};

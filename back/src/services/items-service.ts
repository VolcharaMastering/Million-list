import { prisma } from "../lib/prisma";

type PaginationInput = {
  limit: number;
  offset: number;
};

type Item = {
  id: number;
};

type ItemsPage = {
  total: number;
  limit: number;
  offset: number;
  items: Item[];
};

const getItemsPage = async ({
  limit,
  offset,
}: PaginationInput): Promise<ItemsPage> => {
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      orderBy: { id: "asc" },
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

import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { selectionStore } from "./selection-store";

// Returns one page of items with total count. Supports search, sort, and excluding selected ids.
const getItemsPage = async ({
  limit,
  offset,
  search,
  sort,
  excludeIds,
}: ListItemsInput): Promise<ItemsPage> => {
  const order = sort === "desc" ? "DESC" : "ASC";
  const excludeList =
    excludeIds && excludeIds.size > 0 ? [...excludeIds].map((id) => BigInt(id)) : [];

  if (search !== undefined && search.trim() !== "") {
    const pattern = `%${search.trim()}%`;
    const whereClause =
      excludeList.length > 0
        ? Prisma.sql`id::text LIKE ${pattern} AND id NOT IN (${Prisma.join(excludeList.map((id) => Prisma.sql`${id}`), ", ")})`
        : Prisma.sql`id::text LIKE ${pattern}`;
    const [items, countResult] = await Promise.all([
      prisma.$queryRaw<Row[]>`
        SELECT id FROM items
        WHERE ${whereClause}
        ORDER BY id ${Prisma.raw(order)}
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint AS count FROM items
        WHERE ${whereClause}
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

  const where =
    excludeList.length > 0
      ? { id: { notIn: excludeList } }
      : undefined;
  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { id: sort },
      take: limit,
      skip: offset,
    }),
    prisma.item.count({ where }),
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

// Returns one page of selected ids (right panel) in user-defined in-memory order.
// Filtering does not change stored order; it only affects the returned page.
const getSelectedPage = ({
  limit,
  offset,
  search,
}: ListSelectedInput): ItemsPage => {
  let ids = selectionStore.getIds();
  if (search !== undefined && search.trim() !== "") {
    const term = search.trim();
    ids = ids.filter((id) => String(id).includes(term));
  }
  const total = ids.length;
  const pageIds = ids.slice(offset, offset + limit);
  return {
    total,
    limit,
    offset,
    items: pageIds.map((id) => ({ id })),
  };
};

export const itemsService = {
  getItemsPage,
  addItems,
  getSelectedPage,
};

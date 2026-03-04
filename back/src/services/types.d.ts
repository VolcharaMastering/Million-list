type ListItemsInput = {
  limit: number;
  offset: number;
  search?: string;
  sort: "asc" | "desc";
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

type Row = { id: bigint };

type AddItemsResult = {
  added: number[];
  alreadyExists: number[];
};

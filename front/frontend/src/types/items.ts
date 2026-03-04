export type Item = { id: number };

export type ItemsPage = {
  total: number;
  limit: number;
  offset: number;
  items: Item[];
};

export type ListAvailableParams = {
  limit: number;
  offset: number;
  search?: string;
  sort: "asc" | "desc";
};

export type ListSelectedParams = {
  limit: number;
  offset: number;
  search?: string;
};

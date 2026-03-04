import { axiosInstance } from "../config/axiosInstance";
import type {
  ItemsPage,
  ListAvailableParams,
  ListSelectedParams,
} from "../types/items";

const PAGE_SIZE = 20;
// Batch add-new (POST /items) every 10s with dedupe.
const BATCH_ADD_INTERVAL_MS = 10_000;
// Rate limit: at most one get/update request to backend per second.
const FETCH_THROTTLE_MS = 1_000;

let fetchThrottleTimer: ReturnType<typeof setTimeout> | null = null;
const fetchThrottleQueue: Array<() => Promise<void>> = [];

const runNextFetch = async () => {
  if (fetchThrottleQueue.length === 0) {
    fetchThrottleTimer = null;
    return;
  }
  const fn = fetchThrottleQueue.shift();
  if (fn) {
    await fn();
  }
  fetchThrottleTimer = setTimeout(runNextFetch, FETCH_THROTTLE_MS);
};

const throttleFetch = async <T>(fn: () => Promise<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const run = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    const wasEmpty = fetchThrottleQueue.length === 0;
    fetchThrottleQueue.push(run);
    if (fetchThrottleTimer === null) {
      if (wasEmpty) {
        runNextFetch();
      } else {
        fetchThrottleTimer = setTimeout(runNextFetch, FETCH_THROTTLE_MS);
      }
    }
  });
};

export type AddNewResult = {
  added: number[];
  alreadyExists?: number[];
  invalid?: unknown[];
};

const addNewPendingIds = new Set<number>();
let addNewFlushTimer: ReturnType<typeof setTimeout> | null = null;
let addNewFlushPromise: Promise<AddNewResult> | null = null;
let addNewFlushResolve: ((r: AddNewResult) => void) | null = null;
let addNewFlushReject: ((e: unknown) => void) | null = null;

const flushAddNew = async (): Promise<AddNewResult> => {
  if (addNewPendingIds.size === 0) {
    const result: AddNewResult = { added: [] };
    addNewFlushResolve?.(result);
    addNewFlushPromise = null;
    addNewFlushResolve = null;
    addNewFlushReject = null;
    return result;
  }
  const ids = [...addNewPendingIds];
  addNewPendingIds.clear();
  try {
    const res = await axiosInstance.post<AddNewResult>("/items", ids);
    addNewFlushResolve?.(res.data);
    addNewFlushResolve = null;
    addNewFlushReject = null;
    addNewFlushPromise = null;
    return res.data;
  } catch (err) {
    addNewFlushReject?.(err);
    addNewFlushResolve = null;
    addNewFlushReject = null;
    addNewFlushPromise = null;
    throw err;
  }
};

const scheduleAddNewFlush = (): Promise<AddNewResult> => {
  if (addNewFlushPromise !== null) return addNewFlushPromise;
  addNewFlushPromise = new Promise<AddNewResult>((resolve, reject) => {
    addNewFlushResolve = resolve;
    addNewFlushReject = reject;
  });
  if (addNewFlushTimer !== null) clearTimeout(addNewFlushTimer);
  addNewFlushTimer = setTimeout(() => {
    addNewFlushTimer = null;
    flushAddNew();
  }, BATCH_ADD_INTERVAL_MS);
  return addNewFlushPromise;
};

export const itemsApi = {
  PAGE_SIZE,

  getAvailablePage: async (params: ListAvailableParams): Promise<ItemsPage> => {
    const query = {
      limit: params.limit ?? PAGE_SIZE,
      offset: params.offset,
      sort: params.sort,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    };
    return throttleFetch(async () => {
      const res = await axiosInstance.get<ItemsPage>("/items", {
        params: query,
      });
      return res.data;
    });
  },

  getSelectedOrder: async (): Promise<{ orderedIds: number[] }> => {
    return throttleFetch(async () => {
      const res = await axiosInstance.get<{ orderedIds: number[] }>(
        "/items/selected/order",
      );
      return res.data;
    });
  },

  getSelectedPage: async (params: ListSelectedParams): Promise<ItemsPage> => {
    const query = {
      limit: params.limit ?? PAGE_SIZE,
      offset: params.offset,
      ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    };
    return throttleFetch(async () => {
      const res = await axiosInstance.get<ItemsPage>("/items/selected", {
        params: query,
      });
      return res.data;
    });
  },

  addToSelected: async (ids: number[]): Promise<{ added: number[] }> => {
    return throttleFetch(async () => {
      const res = await axiosInstance.post<{ added: number[] }>(
        "/items/selected",
        { ids },
      );
      return res.data;
    });
  },

  removeFromSelected: async (ids: number[]): Promise<{ removed: number[] }> => {
    return throttleFetch(async () => {
      const res = await axiosInstance.delete<{ removed: number[] }>(
        "/items/selected",
        { data: { ids } },
      );
      return res.data;
    });
  },

  reorderSelected: async (
    orderedIds: number[],
  ): Promise<{ orderedIds: number[] }> => {
    return throttleFetch(async () => {
      const res = await axiosInstance.patch<{ orderedIds: number[] }>(
        "/items/selected",
        { orderedIds },
      );
      return res.data;
    });
  },

  addNewItems: (ids: number[]): Promise<AddNewResult> => {
    ids.forEach((id) => addNewPendingIds.add(id));
    return scheduleAddNewFlush();
  },

  flushAddNewNow: (): Promise<AddNewResult> => {
    if (addNewFlushTimer !== null) {
      clearTimeout(addNewFlushTimer);
      addNewFlushTimer = null;
    }
    return flushAddNew();
  },
};

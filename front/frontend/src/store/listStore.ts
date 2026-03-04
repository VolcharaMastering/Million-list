import { create } from "zustand";
import type { Item } from "../types/items";
import { itemsApi, type AddNewResult } from "../api/itemsApi";

type SortDir = "asc" | "desc";

type ListState = {
  items: Item[];
  total: number;
  offset: number;
  loading: boolean;
};

type AvailableState = ListState & {
  search: string;
  sort: SortDir;
  selectedIds: Set<number>;
};

type SelectedState = ListState & {
  search: string;
  /** Full ordered ids from server (for reorder). */
  orderedIds: number[];
};

type ListStore = {
  available: AvailableState;
  selected: SelectedState;

  setAvailableSearch: (search: string) => void;
  setAvailableSort: (sort: SortDir) => void;
  setSelectedSearch: (search: string) => void;
  toggleAvailableSelection: (id: number) => void;
  clearAvailableSelection: () => void;

  loadAvailablePage: (append: boolean) => Promise<void>;
  loadSelectedPage: (append: boolean) => Promise<void>;
  loadSelectedOrder: () => Promise<void>;
  initializeSelected: () => Promise<void>;

  addToSelected: (ids: number[]) => Promise<void>;
  removeFromSelected: (ids: number[]) => Promise<void>;
  reorderSelected: (orderedIds: number[]) => Promise<void>;
  reorderSelectedByVisibleIds: (
    activeId: string,
    overId: string
  ) => Promise<void>;
  sortSelectedByDirection: (direction: SortDir) => Promise<void>;
  addNewItems: (ids: number[]) => Promise<AddNewResult>;
};

const emptyListState = (): ListState => ({
  items: [],
  total: 0,
  offset: 0,
  loading: false,
});

const matchesSearch = (id: number, search: string) =>
  search.trim() === "" || String(id).includes(search.trim());

const buildSelectedView = (
  orderedIds: number[],
  search: string,
  loadedCount: number
) => {
  const filteredIds = orderedIds.filter((id) => matchesSearch(id, search));
  const items = filteredIds.slice(0, loadedCount).map((id) => ({ id }));
  return {
    items,
    total: filteredIds.length,
    offset: items.length,
  };
};

const moveArrayItem = (arr: number[], from: number, to: number) => {
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const useListStore = create<ListStore>((set, get) => ({
  available: {
    ...emptyListState(),
    search: "",
    sort: "asc",
    selectedIds: new Set(),
  },
  selected: {
    ...emptyListState(),
    search: "",
    orderedIds: [],
  },

  setAvailableSearch: (search) =>
    set((state) => ({
      available: { ...state.available, search },
    })),

  setAvailableSort: (sort) =>
    set((state) => ({
      available: { ...state.available, sort },
    })),

  setSelectedSearch: (search) =>
    set((state) => ({
      selected: { ...state.selected, search },
    })),

  toggleAvailableSelection: (id) =>
    set((state) => {
      const next = new Set(state.available.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { available: { ...state.available, selectedIds: next } };
    }),

  clearAvailableSelection: () =>
    set((state) => ({
      available: { ...state.available, selectedIds: new Set() },
    })),

  loadAvailablePage: async (append) => {
    const { available } = get();
    if (available.loading) return;
    set((state) => ({
      available: { ...state.available, loading: true },
    }));
    const offset = append ? available.offset : 0;
    const params = {
      limit: itemsApi.PAGE_SIZE,
      offset,
      sort: available.sort,
      ...(available.search.trim() ? { search: available.search.trim() } : {}),
    };
    try {
      const page = await itemsApi.getAvailablePage(params);
      set((state) => {
        const prev = state.available;
        const items = append ? [...prev.items, ...page.items] : page.items;
        return {
          available: {
            ...prev,
            items,
            total: page.total,
            offset: offset + page.items.length,
            loading: false,
          },
        };
      });
    } catch {
      set((state) => ({
        available: { ...state.available, loading: false },
      }));
    }
  },

  loadSelectedPage: async (append) => {
    const { selected } = get();
    if (selected.loading) return;
    set((state) => ({
      selected: { ...state.selected, loading: true },
    }));
    const offset = append ? selected.offset : 0;
    const params = {
      limit: itemsApi.PAGE_SIZE,
      offset,
      ...(selected.search.trim() ? { search: selected.search.trim() } : {}),
    };
    try {
      const page = await itemsApi.getSelectedPage(params);
      set((state) => {
        const prev = state.selected;
        const items = append ? [...prev.items, ...page.items] : page.items;
        return {
          selected: {
            ...prev,
            items,
            total: page.total,
            offset: offset + page.items.length,
            loading: false,
          },
        };
      });
    } catch {
      set((state) => ({
        selected: { ...state.selected, loading: false },
      }));
    }
  },

  loadSelectedOrder: async () => {
    try {
      const { orderedIds } = await itemsApi.getSelectedOrder();
      set((state) => ({
        selected: {
          ...state.selected,
          orderedIds,
          ...buildSelectedView(
            orderedIds,
            state.selected.search,
            Math.max(state.selected.items.length, state.selected.offset)
          ),
        },
      }));
    } catch {
      // ignore
    }
  },

  initializeSelected: async () => {
    await get().loadSelectedOrder();
    await get().loadSelectedPage(false);
  },

  addToSelected: async (ids) => {
    if (ids.length === 0) return;

    const state = get();
    const uniqueIncoming = [...new Set(ids)];
    const nextOrderedIds = [...state.selected.orderedIds];
    for (const id of uniqueIncoming) {
      if (!nextOrderedIds.includes(id)) nextOrderedIds.push(id);
    }

    set((prevState) => {
      const removedSet = new Set(uniqueIncoming);
      const nextAvailableItems = prevState.available.items.filter(
        (item) => !removedSet.has(item.id)
      );
      const optimisticLoadedCount = Math.max(
        prevState.selected.items.length,
        prevState.selected.offset,
        itemsApi.PAGE_SIZE
      );
      return {
        available: {
          ...prevState.available,
          items: nextAvailableItems,
          total: Math.max(0, prevState.available.total - removedSet.size),
          selectedIds: new Set(),
        },
        selected: {
          ...prevState.selected,
          orderedIds: nextOrderedIds,
          ...buildSelectedView(
            nextOrderedIds,
            prevState.selected.search,
            optimisticLoadedCount
          ),
        },
      };
    });

    // Sync in background, UI is already updated.
    void (async () => {
      try {
        await itemsApi.addToSelected(uniqueIncoming);
        await Promise.all([get().loadAvailablePage(false), get().loadSelectedOrder()]);
      } catch {
        await Promise.all([get().loadAvailablePage(false), get().loadSelectedOrder(), get().loadSelectedPage(false)]);
      }
    })();
  },

  removeFromSelected: async (ids) => {
    if (ids.length === 0) return;
    await itemsApi.removeFromSelected(ids);
    await Promise.all([
      get().loadAvailablePage(false),
      get().loadSelectedPage(false),
      get().loadSelectedOrder(),
    ]);
  },

  reorderSelected: async (orderedIds) => {
    const state = get();
    const previousOrderedIds = state.selected.orderedIds;
    const optimisticLoadedCount = Math.max(
      state.selected.items.length,
      state.selected.offset,
      itemsApi.PAGE_SIZE
    );

    set((state) => ({
      selected: {
        ...state.selected,
        orderedIds,
        ...buildSelectedView(
          orderedIds,
          state.selected.search,
          optimisticLoadedCount
        ),
      },
    }));

    // Persist in background, rollback via refetch on failure.
    void (async () => {
      try {
        await itemsApi.reorderSelected(orderedIds);
      } catch {
        set((prevState) => ({
          selected: {
            ...prevState.selected,
            orderedIds: previousOrderedIds,
            ...buildSelectedView(
              previousOrderedIds,
              prevState.selected.search,
              optimisticLoadedCount
            ),
          },
        }));
        await Promise.all([get().loadSelectedOrder(), get().loadSelectedPage(false)]);
      }
    })();
  },

  reorderSelectedByVisibleIds: async (activeId, overId) => {
    const state = get();
    const activeNum = Number(activeId);
    const overNum = Number(overId);
    if (!Number.isFinite(activeNum) || !Number.isFinite(overNum)) return;
    if (activeNum === overNum) return;

    let orderedIds = state.selected.orderedIds;
    if (orderedIds.length === 0 && state.selected.total > 0) {
      await get().loadSelectedOrder();
      orderedIds = get().selected.orderedIds;
    }
    if (orderedIds.length === 0) {
      orderedIds = state.selected.items.map((i) => i.id);
    }

    const oldIndex = orderedIds.indexOf(activeNum);
    const newIndex = orderedIds.indexOf(overNum);
    if (oldIndex === -1 || newIndex === -1) return;

    const nextOrdered = moveArrayItem(orderedIds, oldIndex, newIndex);
    await get().reorderSelected(nextOrdered);
  },

  sortSelectedByDirection: async (direction) => {
    const state = get();
    let orderedIds = state.selected.orderedIds;
    if (orderedIds.length === 0 && state.selected.total > 0) {
      await get().loadSelectedOrder();
      orderedIds = get().selected.orderedIds;
    }
    if (orderedIds.length === 0) {
      orderedIds = state.selected.items.map((i) => i.id);
    }

    const nextOrdered = [...orderedIds].sort((a, b) =>
      direction === "asc" ? a - b : b - a
    );
    await get().reorderSelected(nextOrdered);
  },

  addNewItems: async (ids) => {
    if (ids.length === 0) return { added: [] };
    const result = await itemsApi.addNewItems(ids);
    await get().loadAvailablePage(false);
    return result;
  },
}));

// In-memory store for selected ids (right panel). Order = user order.
// visible for all visitors; lost on process restart.

const selectedIds: number[] = [];
const selectedSet = new Set<number>();

const add = (ids: number[]): number[] => {
  const added: number[] = [];
  for (const id of ids) {
    if (selectedSet.has(id)) continue;
    selectedSet.add(id);
    selectedIds.push(id);
    added.push(id);
  }
  return added;
};

const remove = (ids: number[]): void => {
  const toRemove = new Set(ids);
  for (let i = selectedIds.length - 1; i >= 0; i--) {
    if (toRemove.has(selectedIds[i])) {
      selectedSet.delete(selectedIds[i]);
      selectedIds.splice(i, 1);
    }
  }
};

const setOrder = (orderedIds: number[]): void => {
  const currentIds = [...selectedIds];
  const currentSet = new Set(currentIds);

  // Keep unique ids from incoming order that already exist in selection.
  const seen = new Set<number>();
  const nextOrdered: number[] = [];
  for (const id of orderedIds) {
    if (!currentSet.has(id) || seen.has(id)) continue;
    nextOrdered.push(id);
    seen.add(id);
  }

  // Keep not-sent ids in their previous order.
  for (const id of currentIds) {
    if (!seen.has(id)) {
      nextOrdered.push(id);
      seen.add(id);
    }
  }

  selectedIds.length = 0;
  selectedSet.clear();
  for (const id of nextOrdered) {
    selectedIds.push(id);
    selectedSet.add(id);
  }
};

// Return of selected ids in user order as an array.
const getIds = (): number[] => [...selectedIds];

// Returns a Set containing the selected ids.
const getSet = (): Set<number> => new Set(selectedSet);

// Checks if a specific id is selected.
const has = (id: number): boolean => selectedSet.has(id);

export const selectionStore = {
  add,
  remove,
  setOrder,
  getIds,
  getSet,
  has,
};

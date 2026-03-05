import "./AvailablePanel.scss";
import { useEffect, useRef, useCallback, useState } from "react";
import { TheButton, TheInput, ArrowRight } from "../../ui";
import { PanelToolbar } from "../PanelToolbar/PanelToolbar";
import { ItemRow } from "../ItemRow/ItemRow";
import { AddedStatus } from "../AddedStatus/AddedStatus";
import { useListStore } from "../../store/listStore";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import {
  formatAddNewError,
  formatAddNewSuccess,
} from "../../utils/formatAddNewStatus";

export const AvailablePanel = () => {
  const {
    available,
    setAvailableSearch,
    setAvailableSort,
    toggleAvailableSelection,
    loadAvailablePage,
    addToSelected,
    addNewItems,
  } = useListStore();

  const [newIdValue, setNewIdValue] = useState("");
  const [searchInput, setSearchInput] = useState(available.search);
  const [addedStatus, setAddedStatus] = useState<{
    text: string;
    tone: "success" | "error";
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    loadAvailablePage(true);
  }, [loadAvailablePage]);

  useEffect(() => {
    loadAvailablePage(false);
  }, [loadAvailablePage, available.search, available.sort]);

  const handleScroll = useInfiniteScroll({
    scrollRef,
    loading: available.loading,
    total: available.total,
    itemCount: available.items.length,
    loadMore,
  });

  const handleAddToSelected = () => {
    const ids = [...available.selectedIds];
    if (ids.length > 0) addToSelected(ids);
  };

  const handleAddNew = () => {
    const raw = newIdValue.trim();
    if (!raw) return;
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 1) return;
    setNewIdValue("");
    void (async () => {
      try {
        const result = await addNewItems([id]);
        setAddedStatus(formatAddNewSuccess(result));
      } catch (error) {
        setAddedStatus(formatAddNewError(error));
      }
    })();
  };

  useEffect(() => {
    if (addedStatus === null) return;
    const timeoutId = setTimeout(() => {
      setAddedStatus(null);
    }, 10_000);
    return () => clearTimeout(timeoutId);
  }, [addedStatus]);

  const selectedCount = available.selectedIds.size;

  return (
    <aside className="panel available-panel" aria-label="Available items">
      <div className="available-panel__title-row">
        <h2 className="panelTitle">Available</h2>
        {addedStatus && (
          <AddedStatus text={addedStatus.text} tone={addedStatus.tone} />
        )}
      </div>

      <PanelToolbar
        toolbarClassName="available-panel__toolbar"
        searchClassName="available-panel__search"
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onApplySearch={() => setAvailableSearch(searchInput)}
        onSortAsc={() => setAvailableSort("asc")}
        onSortDesc={() => setAvailableSort("desc")}
      />

      <div className="available-panel__add-new">
        <TheInput
          value={newIdValue}
          onChange={setNewIdValue}
          placeholder="New ID"
          numericOnly
          className="available-panel__new-id-input"
        />
        <TheButton variant="primary" size="small" onClick={handleAddNew}>
          Add
        </TheButton>
      </div>

      {selectedCount > 0 && (
        <TheButton
          variant="primary"
          icon={ArrowRight}
          iconPosition="right"
          onClick={handleAddToSelected}
        >
          Add to selected ({selectedCount})
        </TheButton>
      )}

      <div
        ref={scrollRef}
        className="panelContent"
        onScroll={handleScroll}
        role="list"
      >
        {available.items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            checked={available.selectedIds.has(item.id)}
            onToggleCheck={toggleAvailableSelection}
            action={
              <TheButton
                variant="secondary"
                size="small"
                icon={ArrowRight}
                aria-label={`Add ${item.id} to selected`}
                onClick={() => addToSelected([item.id])}
              />
            }
          />
        ))}
        {available.loading && (
          <div className="available-panel__loading">Loading…</div>
        )}
        {!available.loading && available.items.length === 0 && (
          <div className="available-panel__empty">No items</div>
        )}
      </div>
    </aside>
  );
};

import "./AvailablePanel.scss";
import { useEffect, useRef, useCallback, useState } from "react";
import { isAxiosError } from "axios";
import { TheButton, TheInput, ArrowRight, Search, ArrowUp, ArrowDown } from "../../ui";
import { ItemRow } from "../ItemRow/ItemRow";
import { AddedStatus } from "../AddedStatus/AddedStatus";
import { useListStore } from "../../store/listStore";

const SCROLL_THRESHOLD = 100;

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

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (
      !el ||
      available.loading ||
      available.total === 0 ||
      available.items.length >= available.total
    )
      return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
      loadMore();
    }
  }, [available.loading, available.items.length, available.total, loadMore]);

  // Load more when list does not fill the scroll area (no scrollbar yet).
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (
        !el ||
        available.loading ||
        available.total === 0 ||
        available.items.length >= available.total
      )
        return;
      const { scrollHeight, clientHeight } = el;
      if (scrollHeight - clientHeight < SCROLL_THRESHOLD) {
        loadMore();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [
    available.items.length,
    available.total,
    available.loading,
    loadMore,
  ]);

  const handleAddToSelected = () => {
    const ids = [...available.selectedIds];
    if (ids.length > 0) addToSelected(ids);
  };

  const handleAddNew = () => {
    const raw = newIdValue.trim();
    if (!raw) return;
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 1) return;
    void (async () => {
      try {
        const result = await addNewItems([id]);
        const addedIds = result.added.join(", ");
        const alreadyExistsIds = (result.alreadyExists ?? []).join(", ");
        const textParts = [`Successfully added: ${addedIds || "-"}`];
        if ((result.alreadyExists ?? []).length > 0) {
          textParts.push(`Already exists: ${alreadyExistsIds}`);
        }
        setAddedStatus({
          text: textParts.join(". "),
          tone: "success",
        });
      } catch (error) {
        const errorPayload = isAxiosError(error)
          ? (error.response?.data as
              | {
                  message?: string;
                  error?: {
                    message?: string;
                    alreadyExists?: number[];
                  };
                }
              | undefined)
          : undefined;
        const responseMessage =
          errorPayload?.error?.message ?? errorPayload?.message;
        const alreadyExistsIds = (errorPayload?.error?.alreadyExists ?? []).join(
          ", ",
        );
        const textParts = [responseMessage ?? "Error"];
        if ((errorPayload?.error?.alreadyExists ?? []).length > 0) {
          textParts.push(`Already exists: ${alreadyExistsIds}`);
        }
        setAddedStatus({
          text: textParts.join(". "),
          tone: "error",
        });
      }
    })();
    setNewIdValue("");
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

      <div className="available-panel__toolbar">
        <TheInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Filter by ID"
          numericOnly
          className="available-panel__search"
        />
        <TheButton
          variant="secondary"
          size="small"
          icon={Search}
          aria-label="Apply filter"
          onClick={() => setAvailableSearch(searchInput)}
        />
        <TheButton
          variant="secondary"
          size="small"
          icon={ArrowUp}
          onClick={() => setAvailableSort("asc")}
        >
          Sort Asc
        </TheButton>
        <TheButton
          variant="secondary"
          size="small"
          icon={ArrowDown}
          onClick={() => setAvailableSort("desc")}
        >
          Sort Desc
        </TheButton>
      </div>

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

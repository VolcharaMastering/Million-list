import "./SelectedPanel.scss";
import { useEffect, useRef, useCallback, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  TheButton,
  TheInput,
  Search,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "../../ui";
import { ItemRow } from "../ItemRow/ItemRow";
import { useListStore } from "../../store/listStore";
import type { Item } from "../../types/items";

const SCROLL_THRESHOLD = 100;

const SortableRow = ({ item }: { item: Item }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(item.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = (
    <span
      ref={setActivatorNodeRef}
      className="selected-panel__grip"
      {...attributes}
      {...listeners}
    >
      <GripVertical size={18} aria-hidden />
    </span>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "selected-panel__row--dragging" : ""}
    >
      <ItemRow item={item} dragHandle={dragHandle} />
    </div>
  );
};

export const SelectedPanel = () => {
  const {
    selected,
    setSelectedSearch,
    loadSelectedPage,
    initializeSelected,
    reorderSelectedByVisibleIds,
    sortSelectedByDirection,
  } = useListStore();

  const [searchInput, setSearchInput] = useState(selected.search);
  const [isSorting, setIsSorting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const loadMore = useCallback(() => {
    loadSelectedPage(true);
  }, [loadSelectedPage]);

  useEffect(() => {
    initializeSelected();
  }, [initializeSelected]);

  useEffect(() => {
    loadSelectedPage(false);
  }, [loadSelectedPage, selected.search]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (
      !el ||
      isSorting ||
      selected.loading ||
      selected.total === 0 ||
      selected.items.length >= selected.total
    )
      return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
      loadMore();
    }
  }, [isSorting, selected.loading, selected.items.length, selected.total, loadMore]);

  // Load next page when list does not fill container yet.
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (
        !el ||
        isSorting ||
        selected.loading ||
        selected.total === 0 ||
        selected.items.length >= selected.total
      )
        return;
      const { scrollHeight, clientHeight } = el;
      if (scrollHeight - clientHeight < SCROLL_THRESHOLD) {
        loadMore();
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [
    isSorting,
    selected.loading,
    selected.items.length,
    selected.total,
    loadMore,
  ]);

  const handleDragStart = () => {
    setIsSorting(true);
  };

  const handleDragCancel = () => {
    setIsSorting(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsSorting(false);
    const { active, over } = event;
    if (over === null) return;
    await reorderSelectedByVisibleIds(String(active.id), String(over.id));
  };

  const handleSortClick = async (direction: "asc" | "desc") =>
    sortSelectedByDirection(direction);

  const itemIds = selected.items.map((i) => String(i.id));

  return (
    <aside className="panel selected-panel" aria-label="Selected items">
      <h2 className="panelTitle">Selected</h2>

      <div className="selected-panel__toolbar">
        <TheInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Filter by ID"
          numericOnly
          className="selected-panel__search"
        />
        <TheButton
          variant="secondary"
          size="small"
          icon={Search}
          aria-label="Apply filter"
          onClick={() => setSelectedSearch(searchInput)}
        />
        <TheButton
          variant="secondary"
          size="small"
          icon={ArrowUp}
          onClick={() => handleSortClick("asc")}
        >
          Sort Asc
        </TheButton>
        <TheButton
          variant="secondary"
          size="small"
          icon={ArrowDown}
          onClick={() => handleSortClick("desc")}
        >
          Sort Desc
        </TheButton>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div
            ref={scrollRef}
            className="panelContent"
            onScroll={handleScroll}
            role="list"
          >
            {selected.items.map((item) => (
              <SortableRow key={item.id} item={item} />
            ))}
            {selected.loading && (
              <div className="selected-panel__loading">Loading…</div>
            )}
            {!selected.loading && selected.items.length === 0 && (
              <div className="selected-panel__empty">No selected items</div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </aside>
  );
};

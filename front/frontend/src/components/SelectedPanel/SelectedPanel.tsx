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
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useListStore } from "../../store/listStore";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { PanelToolbar } from "../PanelToolbar/PanelToolbar";
import { SortableRow } from "./SortableRow";

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

  const handleScroll = useInfiniteScroll({
    scrollRef,
    loading: selected.loading,
    total: selected.total,
    itemCount: selected.items.length,
    loadMore,
    blockLoad: isSorting,
  });

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

      <PanelToolbar
        toolbarClassName="selected-panel__toolbar"
        searchClassName="selected-panel__search"
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onApplySearch={() => setSelectedSearch(searchInput)}
        onSortAsc={() => handleSortClick("asc")}
        onSortDesc={() => handleSortClick("desc")}
      />

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

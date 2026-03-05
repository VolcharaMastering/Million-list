import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "../../ui";
import { ItemRow } from "../ItemRow/ItemRow";
import type { Item } from "../../types/items";

type SortableRowProps = { item: Item };

export const SortableRow = ({ item }: SortableRowProps) => {
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

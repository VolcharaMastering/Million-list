import "./ItemRow.scss";
import type { Item } from "../../types/items";
import { TheCheckbox } from "../../ui";
import type { ReactNode } from "react";

export type ItemRowProps = {
  item: Item;
  /** Checkbox for selection (left panel). */
  checked?: boolean;
  onToggleCheck?: (id: number) => void;
  /** Drag handle for sortable list (right panel). */
  dragHandle?: ReactNode;
  /** Optional action button (e.g. add to selected). */
  action?: ReactNode;
};

export const ItemRow = ({
  item,
  checked = false,
  onToggleCheck,
  dragHandle,
  action,
}: ItemRowProps) => (
  <div className="item-row">
    {onToggleCheck !== undefined && (
      <TheCheckbox
        checked={checked}
        onChange={() => onToggleCheck(item.id)}
        aria-label={`Select item ${item.id}`}
      />
    )}
    {dragHandle}
    <span className="item-row__id">{item.id}</span>
    {action && <span className="item-row__action">{action}</span>}
  </div>
);

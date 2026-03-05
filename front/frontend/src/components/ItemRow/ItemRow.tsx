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
    {onToggleCheck !== undefined ? (
      <button
        type="button"
        className="item-row__selectable"
        onClick={() => onToggleCheck(item.id)}
        aria-label={`Select item ${item.id}`}
      >
        <span className="item-row__checkbox-wrap">
          <TheCheckbox
            checked={checked}
            onChange={() => {}}
            aria-hidden
          />
        </span>
        <span className="item-row__id">{item.id}</span>
      </button>
    ) : (
      <>
        {dragHandle}
        <span className="item-row__id">{item.id}</span>
      </>
    )}
    {action != null && (
      <span
        className="item-row__action"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        {action}
      </span>
    )}
  </div>
);

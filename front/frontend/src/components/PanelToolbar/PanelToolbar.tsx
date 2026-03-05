import "./PanelToolbar.scss";
import { TheButton, TheInput, Search, ArrowUp, ArrowDown } from "../../ui";

export type PanelToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onApplySearch: () => void;
  onSortAsc: () => void;
  onSortDesc: () => void;
  toolbarClassName?: string;
  searchClassName?: string;
};

export const PanelToolbar = ({
  searchValue,
  onSearchChange,
  onApplySearch,
  onSortAsc,
  onSortDesc,
  toolbarClassName = "",
  searchClassName = "",
}: PanelToolbarProps) => (
  <div className={toolbarClassName || "panel-toolbar"}>
    <TheInput
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Filter by ID"
      numericOnly
      className={searchClassName || "panel-toolbar__search"}
    />
    <TheButton
      variant="secondary"
      size="small"
      icon={Search}
      aria-label="Apply filter"
      onClick={onApplySearch}
    />
    <TheButton
      variant="secondary"
      size="small"
      icon={ArrowUp}
      onClick={onSortAsc}
    >
      Sort Asc
    </TheButton>
    <TheButton
      variant="secondary"
      size="small"
      icon={ArrowDown}
      onClick={onSortDesc}
    >
      Sort Desc
    </TheButton>
  </div>
);

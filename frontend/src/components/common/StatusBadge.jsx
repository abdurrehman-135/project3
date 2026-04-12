import { classNames } from "../../utils/formatters";

const styleMap = {
  planning: "bg-surface-container-high text-on-surface-variant",
  "in-progress": "bg-tertiary-container/15 text-tertiary",
  blocked: "bg-error-container text-on-error-container",
  completed: "bg-secondary-container/30 text-on-secondary-container",
  archived: "bg-surface-container-high text-on-surface-variant",
  todo: "bg-surface-container-high text-on-surface-variant",
  review: "bg-secondary-container/30 text-on-secondary-container",
  low: "bg-secondary-container/30 text-on-secondary-container",
  medium: "bg-tertiary-container/15 text-tertiary",
  high: "bg-amber-100 text-amber-700",
  critical: "bg-error-container text-on-error-container",
};

const labelMap = {
  "in-progress": "In Progress",
  todo: "To Do",
};

export function StatusBadge({ value, className }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
        styleMap[value] || "bg-surface-container-high text-on-surface-variant",
        className
      )}
    >
      {labelMap[value] || value}
    </span>
  );
}


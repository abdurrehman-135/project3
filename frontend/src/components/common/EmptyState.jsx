import { Plus } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) {
  return (
    <div
      className={`surface-card ${compact ? "p-6" : "p-10"} flex flex-col items-start gap-4 bg-white/80`}
    >
      <div className="rounded-2xl bg-primary/8 p-3 text-primary">
        <Plus size={22} />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-on-surface-variant">{description}</p>
      </div>
      {actionLabel ? (
        <button className="primary-button" onClick={onAction} type="button">
          <Plus size={16} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}


import { X } from "lucide-react";

export function Modal({ open, title, description, children, onClose, wide = false }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-on-surface/20 px-4 backdrop-blur-sm">
      <div
        className={`surface-card w-full ${wide ? "max-w-4xl" : "max-w-2xl"} max-h-[92vh] overflow-y-auto p-6 md:p-8`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            {description ? <p className="text-sm text-on-surface-variant">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-surface-container-low p-2 text-on-surface-variant transition hover:bg-surface-container-high"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}


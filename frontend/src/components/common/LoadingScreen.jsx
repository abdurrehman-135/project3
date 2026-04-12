export function LoadingScreen({ label = "Loading workspace..." }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/15 border-t-primary" />
        <p className="text-sm font-medium text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}


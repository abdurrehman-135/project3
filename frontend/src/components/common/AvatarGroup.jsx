import { getInitials } from "../../utils/formatters";

export function AvatarGroup({ users = [], limit = 3, size = "md" }) {
  const visible = users.slice(0, limit);
  const hidden = Math.max(users.length - visible.length, 0);
  const sizeClass = size === "sm" ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-xs";

  return (
    <div className="flex -space-x-3">
      {visible.map((user) => (
        <div
          key={user._id}
          title={user.name}
          className={`${sizeClass} flex items-center justify-center rounded-full border-2 border-white bg-surface-container-high font-bold text-on-surface`}
        >
          {getInitials(user.name)}
        </div>
      ))}
      {hidden ? (
        <div
          className={`${sizeClass} flex items-center justify-center rounded-full border-2 border-white bg-surface-container-highest font-bold text-on-surface-variant`}
        >
          +{hidden}
        </div>
      ) : null}
    </div>
  );
}

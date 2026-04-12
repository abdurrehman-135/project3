import { Bell, CalendarDays, FolderKanban, LayoutDashboard, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Alerts", to: "/notifications", icon: Bell },
];

export function MobileNav({ onCreateTask }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-xl lg:hidden">
      {items.slice(0, 2).map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-semibold ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}

      <button
        type="button"
        onClick={onCreateTask}
        className="relative -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-lg shadow-primary/30"
      >
        <Plus size={24} />
      </button>

      {items.slice(2).map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-[10px] font-semibold ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`
            }
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

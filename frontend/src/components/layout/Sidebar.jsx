import { FolderKanban, LayoutDashboard, Bell, CalendarDays, KanbanSquare, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Task Board", to: "/tasks/board", icon: KanbanSquare },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Notifications", to: "/notifications", icon: Bell },
];

export function Sidebar({ onCreateTask, onCreateProject }) {
  return (
    <aside className="hidden h-screen w-72 shrink-0 flex-col bg-surface-container-low px-5 py-7 lg:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-primary/20">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight">TaskFlow</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">
            The Fluid Architect
          </p>
        </div>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-primary/7 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <button type="button" className="primary-button w-full" onClick={onCreateTask}>
          <Plus size={16} />
          Create Task
        </button>
        <button type="button" className="secondary-button w-full" onClick={onCreateProject}>
          <Plus size={16} />
          New Project
        </button>
      </div>
    </aside>
  );
}


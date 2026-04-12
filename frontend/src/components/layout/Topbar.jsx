import { Bell, Plus, Search, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { getInitials } from "../../utils/formatters";

export function Topbar({ onCreateTask, onCreateProject }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { user } = useSelector((state) => state.auth);
  const unreadCount = useSelector((state) => state.notifications.items.filter((item) => !item.read).length);

  const userLabel = useMemo(() => getInitials(user?.name || "U"), [user?.name]);

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(`/projects?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-40 border-none bg-white/70 px-4 py-4 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="ghost-input pl-11"
            placeholder="Search projects, tasks, or collaborators..."
          />
        </form>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <div className="hidden items-center gap-3 md:flex">
            <button type="button" className="secondary-button" onClick={onCreateProject}>
              <Plus size={16} />
              Project
            </button>
            <button type="button" className="primary-button" onClick={onCreateTask}>
              <Plus size={16} />
              Task
            </button>
          </div>

          <button
            type="button"
            className="relative rounded-full bg-surface-container-low p-3 text-on-surface-variant transition hover:text-primary"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={18} />
            {unreadCount ? (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-white" />
            ) : null}
          </button>

          <div className="flex items-center gap-3 rounded-full bg-surface-container-low px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high font-bold text-primary">
              {user?.name ? userLabel : <UserCircle2 size={18} />}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-on-surface-variant">{user?.title || "Workspace Member"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


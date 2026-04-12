import { ArrowRight, CalendarDays, CircleDollarSign } from "lucide-react";
import { Link } from "react-router-dom";

import { AvatarGroup } from "../common/AvatarGroup";
import { StatusBadge } from "../common/StatusBadge";
import { currency, formatDate } from "../../utils/formatters";

export function ProjectCard({ project, featured = false }) {
  return (
    <Link
      to={`/projects/${project._id}`}
      className={`surface-card group block overflow-hidden p-6 transition hover:-translate-y-1 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <StatusBadge value={project.status} />
        </div>
        <ArrowRight size={18} className="text-on-surface-variant transition group-hover:text-primary" />
      </div>

      <div className="space-y-3">
        <h3 className={`${featured ? "text-3xl" : "text-xl"} font-black tracking-tight transition group-hover:text-primary`}>
          {project.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-6 text-on-surface-variant">{project.description || "No description yet."}</p>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
          <span>Velocity</span>
          <span>{project.metrics?.progress || 0}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-brand-gradient"
            style={{ width: `${project.metrics?.progress || 0}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <AvatarGroup users={project.members || []} />
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} />
            {formatDate(project.dueDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CircleDollarSign size={14} />
            {currency(project.budget)}
          </span>
        </div>
      </div>
    </Link>
  );
}


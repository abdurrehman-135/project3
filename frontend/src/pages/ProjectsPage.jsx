import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { EmptyState } from "../components/common/EmptyState";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { ProjectCard } from "../components/projects/ProjectCard";
import { fetchProjects } from "../features/projects/projectsSlice";

export function ProjectsPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { list, status } = useSelector((state) => state.projects);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    status: "all",
    priority: "all",
    sort: "updatedAt",
  });

  useEffect(() => {
    setFilters((current) => ({ ...current, search: searchParams.get("search") || "" }));
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchProjects(filters));
  }, [dispatch, filters]);

  const [featured, ...rest] = useMemo(() => list, [list]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Projects</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Search, filter, and sort live projects from MongoDB. Every card here is backed by the API and updates in real time.
          </p>
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(180px,1fr))]">
          <input
            className="ghost-input"
            placeholder="Search projects..."
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />

          <select
            className="ghost-select"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
          >
            <option value="all">All statuses</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            className="ghost-select"
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            className="ghost-select"
            value={filters.sort}
            onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
          >
            <option value="updatedAt">Recently Updated</option>
            <option value="dueDate">Due Date</option>
            <option value="name">Name</option>
            <option value="priority">Priority</option>
          </select>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">
          <SlidersHorizontal size={14} />
          Responsive filters with backend-powered sorting
        </div>
      </section>

      {status === "loading" && !list.length ? <LoadingScreen label="Loading projects..." /> : null}

      {!list.length && status !== "loading" ? (
        <EmptyState
          title="No projects match yet"
          description="Try loosening your filters or create your first project. Once saved, it will appear here immediately from the API."
        />
      ) : null}

      {list.length ? (
        <section className="grid gap-6 xl:grid-cols-3">
          {featured ? <ProjectCard project={featured} featured /> : null}
          {rest.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchProjects } from "../features/projects/projectsSlice";
import { fetchTasks } from "../features/tasks/tasksSlice";
import { formatDate } from "../utils/formatters";

export function CalendarPage() {
  const dispatch = useDispatch();
  const { list: projects } = useSelector((state) => state.projects);
  const { list: tasks } = useSelector((state) => state.tasks);

  const [month, setMonth] = useState(new Date());
  const [projectFilter, setProjectFilter] = useState("all");

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
  });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchTasks({
        project: projectFilter,
        from: monthStart.toISOString(),
        to: monthEnd.toISOString(),
        sort: "dueDate",
      })
    );
  }, [dispatch, monthEnd, monthStart, projectFilter]);

  const tasksByDay = useMemo(() => {
    return tasks.reduce((accumulator, task) => {
      if (!task.dueDate) return accumulator;
      const key = format(new Date(task.dueDate), "yyyy-MM-dd");
      accumulator[key] = accumulator[key] ? [...accumulator[key], task] : [task];
      return accumulator;
    }, {});
  }, [tasks]);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">{format(month, "MMMM yyyy")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Calendar entries are generated from real task due dates, not static placeholders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-2xl bg-surface-container-high p-1">
            <button type="button" className="secondary-button px-3 py-2" onClick={() => setMonth(subMonths(month, 1))}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="secondary-button px-3 py-2" onClick={() => setMonth(addMonths(month, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>

          <select
            className="ghost-select min-w-[220px]"
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_320px]">
        <div className="surface-card overflow-hidden">
          <div className="grid grid-cols-7 bg-surface-container-low">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDay[key] || [];

              return (
                <div
                  key={key}
                  className={`min-h-[150px] p-3 ${
                    isSameMonth(day, month) ? "bg-surface-container-lowest" : "bg-surface/50 text-on-surface-variant/50"
                  } ${isToday(day) ? "bg-primary/5" : ""}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-sm font-semibold ${isToday(day) ? "text-primary" : ""}`}>
                      {format(day, "d")}
                    </span>
                    {isToday(day) ? (
                      <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                        Today
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    {dayTasks.slice(0, 3).map((task) => (
                      <Link
                        key={task._id}
                        to={`/tasks/${task._id}`}
                        className="block rounded-2xl bg-surface-container-low p-2 text-xs transition hover:bg-surface-container-high"
                      >
                        <p className="font-semibold">{task.title}</p>
                        <p className="mt-1 text-on-surface-variant">{task.project?.name}</p>
                      </Link>
                    ))}
                    {dayTasks.length > 3 ? (
                      <p className="text-[11px] font-semibold text-primary">+{dayTasks.length - 3} more</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="surface-card p-8">
          <h2 className="text-2xl font-black tracking-tight">Upcoming</h2>
          <div className="mt-6 space-y-4">
            {tasks.length ? (
              tasks.slice(0, 6).map((task) => (
                <Link key={task._id} to={`/tasks/${task._id}`} className="block rounded-2xl bg-surface-container-low p-4 transition hover:bg-surface-container-high">
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-2 text-xs text-on-surface-variant">{formatDate(task.dueDate)}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm leading-6 text-on-surface-variant">
                Tasks with due dates in this month will appear here and on the calendar grid.
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}


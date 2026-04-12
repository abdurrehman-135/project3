import { ArrowRight, Bell, CircleAlert, CircleCheckBig, ListTodo, Zap } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { AvatarGroup } from "../components/common/AvatarGroup";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { StatusBadge } from "../components/common/StatusBadge";
import { fetchDashboardOverview } from "../features/dashboard/dashboardSlice";
import { formatRelative } from "../utils/formatters";

const statCards = [
  { key: "totalTasks", label: "Total Tasks", icon: ListTodo },
  { key: "inProgressTasks", label: "In Progress", icon: Zap },
  { key: "completedTasks", label: "Completed", icon: CircleCheckBig },
  { key: "overdueTasks", label: "Overdue", icon: CircleAlert },
];

export function DashboardPage() {
  const dispatch = useDispatch();
  const { stats, projectVelocity, activeProjects, upcomingTasks, recentActivity, status } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardOverview());
  }, [dispatch]);

  if (status === "loading" && !stats) {
    return <LoadingScreen label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-on-surface-variant">Workspace intelligence</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Your project pulse, in real time.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Every number below comes from the API, persisted in MongoDB, and refreshed live through Socket.io events.
          </p>
        </div>
        <Link to="/projects" className="secondary-button self-start md:self-auto">
          Explore Projects
          <ArrowRight size={16} />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.key} className="surface-card flex min-h-[150px] flex-col justify-between p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-on-surface-variant">{card.label}</p>
                <div className="rounded-2xl bg-primary/8 p-3 text-primary">
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-4xl font-black tracking-tight">{stats?.[card.key] ?? 0}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <div className="space-y-8">
          <div className="surface-card p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight">Project Velocity</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Completed tasks over the last seven days.</p>
              </div>
            </div>
            <div className="flex h-64 items-end gap-4">
              {projectVelocity.map((point) => (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-full w-full items-end rounded-t-2xl bg-surface-container-low">
                    <div
                      className="w-full rounded-t-2xl bg-brand-gradient"
                      style={{ height: `${Math.max(point.value * 16, 12)}px` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                    {point.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Active Projects</h2>
              <Link to="/projects" className="text-sm font-semibold text-primary">
                View All
              </Link>
            </div>

            {activeProjects.length ? (
              <div className="space-y-4">
                {activeProjects.map((project) => (
                  <Link
                    key={project._id}
                    to={`/projects/${project._id}`}
                    className="flex flex-col gap-4 rounded-2xl p-4 transition hover:bg-surface-container-low md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-2">
                      <p className="text-lg font-bold">{project.name}</p>
                      <div className="flex items-center gap-3">
                        <StatusBadge value={project.status} />
                        <span className="text-xs font-medium text-on-surface-variant">
                          {project.metrics?.totalTasks || 0} total tasks
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <AvatarGroup users={project.members || []} size="sm" />
                      <div className="w-28">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant">
                          <span>Progress</span>
                          <span>{project.metrics?.progress || 0}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                          <div
                            className="h-full rounded-full bg-brand-gradient"
                            style={{ width: `${project.metrics?.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                title="Your workspace is ready"
                description="Create a project to light up the dashboard, board, calendar, and activity feed with real data."
              />
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="surface-card p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-primary/8 p-3 text-primary">
                <Bell size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Upcoming Tasks</h2>
                <p className="text-sm text-on-surface-variant">Due soon across your active workspace.</p>
              </div>
            </div>

            {upcomingTasks.length ? (
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <Link key={task._id} to={`/tasks/${task._id}`} className="block rounded-2xl p-4 transition hover:bg-surface-container-low">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-xs text-on-surface-variant">{task.project?.name}</p>
                      </div>
                      <StatusBadge value={task.priority} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-on-surface-variant">
                No active tasks are due soon yet. Once tasks are created, they will appear here automatically.
              </p>
            )}
          </div>

          <div className="surface-card p-8">
            <h2 className="text-2xl font-black tracking-tight">Recent Activity</h2>
            <div className="mt-6 space-y-5">
              {recentActivity.length ? (
                recentActivity.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="mt-1 h-10 w-10 shrink-0 rounded-2xl bg-primary/8" />
                    <div>
                      <p className="text-sm font-semibold">{item.message}</p>
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-on-surface-variant">
                        {formatRelative(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-on-surface-variant">
                  Activity events will stream here as projects and tasks change.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


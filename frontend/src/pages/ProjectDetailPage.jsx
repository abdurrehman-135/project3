import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { AvatarGroup } from "../components/common/AvatarGroup";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { StatusBadge } from "../components/common/StatusBadge";
import { ProjectFormModal } from "../components/forms/ProjectFormModal";
import { TaskFormModal } from "../components/forms/TaskFormModal";
import {
  deleteProject,
  fetchProjectById,
  updateProject,
} from "../features/projects/projectsSlice";
import { createTask, deleteTask, updateTask } from "../features/tasks/tasksSlice";
import { fetchTeam } from "../features/team/teamSlice";
import { currency, formatDate, formatRelative } from "../utils/formatters";

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: project, currentTasks, recentActivity, currentStatus } = useSelector((state) => state.projects);
  const { users: team } = useSelector((state) => state.team);

  const [editingProject, setEditingProject] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectById(projectId));
    dispatch(fetchTeam());
  }, [dispatch, projectId]);

  if (currentStatus === "loading" && !project) {
    return <LoadingScreen label="Loading project..." />;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project may have been deleted or you may not have access to it anymore."
      />
    );
  }

  const handleUpdateProject = async (values) => {
    setBusy(true);
    const result = await dispatch(updateProject({ id: project._id, values }));
    setBusy(false);
    if (updateProject.fulfilled.match(result)) {
      setEditingProject(false);
    }
  };

  const handleCreateTask = async (values) => {
    setBusy(true);
    const result = await dispatch(createTask(values));
    setBusy(false);
    if (createTask.fulfilled.match(result)) {
      setCreatingTask(false);
      dispatch(fetchProjectById(projectId));
    }
  };

  const handleUpdateTask = async (values) => {
    if (!editingTask) return;
    setBusy(true);
    const result = await dispatch(updateTask({ id: editingTask._id, values }));
    setBusy(false);
    if (updateTask.fulfilled.match(result)) {
      setEditingTask(null);
      dispatch(fetchProjectById(projectId));
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;
    await dispatch(deleteTask(taskId));
    dispatch(fetchProjectById(projectId));
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm("Delete this project and all of its tasks?");
    if (!confirmed) return;

    const result = await dispatch(deleteProject(project._id));
    if (deleteProject.fulfilled.match(result)) {
      navigate("/projects");
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="space-y-8">
          <div className="surface-card p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge value={project.status} />
                  <StatusBadge value={project.priority} />
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface-variant">{project.category}</p>
                  <h1 className="mt-2 text-4xl font-black tracking-tight">{project.name}</h1>
                </div>
                <p className="max-w-3xl text-sm leading-7 text-on-surface-variant">
                  {project.description || "This project does not have a description yet."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" className="secondary-button" onClick={() => setEditingProject(true)}>
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  type="button"
                  className="secondary-button bg-error-container text-on-error-container hover:bg-error-container/80"
                  onClick={handleDeleteProject}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-4">
              <div className="surface-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Progress</p>
                <p className="mt-3 text-3xl font-black">{project.metrics?.progress || 0}%</p>
              </div>
              <div className="surface-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Tasks</p>
                <p className="mt-3 text-3xl font-black">{project.metrics?.totalTasks || 0}</p>
              </div>
              <div className="surface-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Budget</p>
                <p className="mt-3 text-3xl font-black">{currency(project.budget)}</p>
              </div>
              <div className="surface-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Due</p>
                <p className="mt-3 text-xl font-black">{formatDate(project.dueDate)}</p>
              </div>
            </div>
          </div>

          <div className="surface-card p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Tasks in this Project</h2>
              <button type="button" className="primary-button" onClick={() => setCreatingTask(true)}>
                Create Task
              </button>
            </div>

            {currentTasks.length ? (
              <div className="overflow-hidden rounded-3xl bg-surface-container-low">
                <div className="hidden grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_auto] gap-4 px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant md:grid">
                  <span>Task</span>
                  <span>Status</span>
                  <span>Assignee</span>
                  <span>Due Date</span>
                  <span>Actions</span>
                </div>

                <div className="divide-y divide-white/50">
                  {currentTasks.map((task) => (
                    <div
                      key={task._id}
                      className="grid gap-4 px-5 py-5 md:grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_auto] md:items-center"
                    >
                      <div>
                        <Link to={`/tasks/${task._id}`} className="font-semibold transition hover:text-primary">
                          {task.title}
                        </Link>
                        <p className="mt-1 text-sm text-on-surface-variant">{task.description || "No description."}</p>
                      </div>
                      <StatusBadge value={task.status} className="w-fit" />
                      <span className="text-sm text-on-surface-variant">{task.assignee?.name || "Unassigned"}</span>
                      <span className="inline-flex items-center gap-2 text-sm text-on-surface-variant">
                        <CalendarDays size={14} />
                        {formatDate(task.dueDate)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button type="button" className="secondary-button px-3 py-2" onClick={() => setEditingTask(task)}>
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="secondary-button bg-error-container px-3 py-2 text-on-error-container hover:bg-error-container/80"
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                compact
                title="No tasks yet"
                description="Create the first task in this project and it will immediately appear across the board, calendar, and dashboard."
                actionLabel="Create Task"
                onAction={() => setCreatingTask(true)}
              />
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="surface-card p-8">
            <h2 className="text-2xl font-black tracking-tight">Team</h2>
            <div className="mt-6 flex items-center justify-between gap-4">
              <AvatarGroup users={project.members || []} />
              <p className="text-sm text-on-surface-variant">{project.members?.length || 0} collaborators</p>
            </div>
          </div>

          <div className="surface-card p-8">
            <h2 className="text-2xl font-black tracking-tight">Recent Activity</h2>
            <div className="mt-6 space-y-5">
              {recentActivity.length ? (
                recentActivity.map((item) => (
                  <div key={item._id}>
                    <p className="text-sm font-semibold">{item.message}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-on-surface-variant">
                      {formatRelative(item.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-on-surface-variant">
                  Activity entries will appear here as the project evolves.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>

      <ProjectFormModal
        open={editingProject}
        onClose={() => setEditingProject(false)}
        onSubmit={handleUpdateProject}
        team={team}
        initialValues={project}
        loading={busy}
      />

      <TaskFormModal
        open={creatingTask}
        onClose={() => setCreatingTask(false)}
        onSubmit={handleCreateTask}
        projects={[project]}
        team={team}
        defaultProjectId={project._id}
        loading={busy}
      />

      <TaskFormModal
        open={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        projects={[project]}
        team={team}
        initialValues={editingTask}
        defaultProjectId={project._id}
        loading={busy}
      />
    </div>
  );
}


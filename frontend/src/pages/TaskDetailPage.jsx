import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { EmptyState } from "../components/common/EmptyState";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { StatusBadge } from "../components/common/StatusBadge";
import { TaskFormModal } from "../components/forms/TaskFormModal";
import { fetchProjects } from "../features/projects/projectsSlice";
import {
  addComment,
  deleteTask,
  fetchTaskById,
  toggleSubtask,
  updateTask,
} from "../features/tasks/tasksSlice";
import { formatDate, formatRelative } from "../utils/formatters";

export function TaskDetailPage() {
  const { taskId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: task, currentStatus } = useSelector((state) => state.tasks);
  const { list: projects } = useSelector((state) => state.projects);
  const { users: team } = useSelector((state) => state.team);

  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(fetchTaskById(taskId));
    dispatch(fetchProjects());
  }, [dispatch, taskId]);

  const projectList = useMemo(() => {
    if (!task?.project) return projects;
    const existing = projects.some((project) => project._id === task.project._id);
    return existing ? projects : [task.project, ...projects];
  }, [projects, task?.project]);

  if (currentStatus === "loading" && !task) {
    return <LoadingScreen label="Loading task..." />;
  }

  if (!task) {
    return (
      <EmptyState title="Task not found" description="This task may have been removed or you may not have access to it." />
    );
  }

  const handleUpdate = async (values) => {
    setBusy(true);
    const result = await dispatch(updateTask({ id: task._id, values }));
    setBusy(false);
    if (updateTask.fulfilled.match(result)) {
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    const result = await dispatch(deleteTask(task._id));
    if (deleteTask.fulfilled.match(result)) {
      navigate("/tasks/board");
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    const result = await dispatch(addComment({ id: task._id, content: comment }));
    if (addComment.fulfilled.match(result)) {
      setComment("");
    }
  };

  return (
    <div className="space-y-8">
      <nav className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
        <Link to="/projects" className="transition hover:text-primary">
          Projects
        </Link>
        <span>/</span>
        <Link to={`/projects/${task.project?._id}`} className="transition hover:text-primary">
          {task.project?.name}
        </Link>
        <span>/</span>
        <span className="text-on-surface">{task.title}</span>
      </nav>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]">
        <div className="space-y-8">
          <div className="surface-card p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge value={task.status} />
                  <StatusBadge value={task.priority} />
                </div>
                <h1 className="text-4xl font-black tracking-tight">{task.title}</h1>
                <p className="max-w-3xl text-sm leading-7 text-on-surface-variant">
                  {task.description || "No description has been added yet."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" className="secondary-button" onClick={() => setEditing(true)}>
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  type="button"
                  className="secondary-button bg-error-container text-on-error-container hover:bg-error-container/80"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="surface-card p-8">
            <h2 className="text-2xl font-black tracking-tight">Activity & Comments</h2>
            <div className="mt-8 space-y-6">
              {task.comments?.length ? (
                task.comments.map((commentItem) => (
                  <div key={commentItem._id} className="rounded-3xl bg-surface-container-low p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{commentItem.author?.name || "Team member"}</p>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-on-surface-variant">
                        {formatRelative(commentItem.createdAt)}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-on-surface-variant">{commentItem.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-on-surface-variant">
                  No comments yet. Post one below and it will be saved and broadcast in real time.
                </p>
              )}

              <form className="space-y-3" onSubmit={handleCommentSubmit}>
                <textarea
                  className="ghost-input min-h-28 resize-none"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Write a response..."
                />
                <div className="flex justify-end">
                  <button type="submit" className="primary-button">
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="surface-card p-8">
            <h2 className="text-2xl font-black tracking-tight">Task Details</h2>
            <div className="mt-6 space-y-5">
              <div className="surface-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Project</p>
                <p className="mt-2 font-semibold">{task.project?.name}</p>
              </div>
              <div className="surface-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Assignee</p>
                <p className="mt-2 font-semibold">{task.assignee?.name || "Unassigned"}</p>
              </div>
              <div className="surface-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Due Date</p>
                <p className="mt-2 inline-flex items-center gap-2 font-semibold">
                  <CalendarDays size={14} />
                  {formatDate(task.dueDate)}
                </p>
              </div>
              <div className="surface-panel">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {task.tags?.length ? (
                    task.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-on-surface-variant">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">Subtasks</h2>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {task.subtasks?.filter((item) => item.completed).length || 0}/{task.subtasks?.length || 0} done
              </span>
            </div>
            <div className="mt-6 space-y-3">
              {task.subtasks?.length ? (
                task.subtasks.map((subtask) => (
                  <label key={subtask._id} className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-4">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => dispatch(toggleSubtask({ id: task._id, subtaskId: subtask._id }))}
                      className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary/20"
                    />
                    <span className={`text-sm ${subtask.completed ? "text-on-surface-variant line-through" : "font-medium"}`}>
                      {subtask.title}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm leading-6 text-on-surface-variant">
                  No subtasks yet. Add them from the edit modal to build a richer checklist.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>

      <TaskFormModal
        open={editing}
        onClose={() => setEditing(false)}
        onSubmit={handleUpdate}
        initialValues={task}
        projects={projectList}
        team={team}
        loading={busy}
      />
    </div>
  );
}


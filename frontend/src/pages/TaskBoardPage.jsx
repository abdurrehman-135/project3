import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { EmptyState } from "../components/common/EmptyState";
import { LoadingScreen } from "../components/common/LoadingScreen";
import { TaskFormModal } from "../components/forms/TaskFormModal";
import { BoardColumn } from "../components/tasks/BoardColumn";
import { fetchProjects } from "../features/projects/projectsSlice";
import { createTask, fetchTasks, updateTask } from "../features/tasks/tasksSlice";

const columns = [
  { key: "todo", title: "To Do", dotClassName: "bg-outline-variant" },
  { key: "in-progress", title: "In Progress", dotClassName: "bg-primary" },
  { key: "review", title: "Review", dotClassName: "bg-secondary" },
  { key: "done", title: "Done", dotClassName: "bg-tertiary" },
];

export function TaskBoardPage() {
  const dispatch = useDispatch();
  const { list: tasks, status } = useSelector((state) => state.tasks);
  const { list: projects } = useSelector((state) => state.projects);
  const { users: team } = useSelector((state) => state.team);

  const [filters, setFilters] = useState({
    project: "all",
    priority: "all",
    sort: "dueDate",
    search: "",
  });
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  const groupedTasks = useMemo(
    () =>
      columns.reduce((accumulator, column) => {
        accumulator[column.key] = tasks.filter((task) => task.status === column.key);
        return accumulator;
      }, {}),
    [tasks]
  );

  const handleCreateTask = async (values) => {
    setBusy(true);
    const result = await dispatch(createTask(values));
    setBusy(false);
    if (createTask.fulfilled.match(result)) {
      setTaskModalOpen(false);
    }
  };

  const handleUpdateTask = async (values) => {
    if (!editingTask) return;
    setBusy(true);
    const result = await dispatch(updateTask({ id: editingTask._id, values }));
    setBusy(false);
    if (updateTask.fulfilled.match(result)) {
      setEditingTask(null);
    }
  };

  const moveTask = (taskId, statusValue) => {
    const task = tasks.find((item) => item._id === taskId);
    if (!task || task.status === statusValue) return;
    dispatch(updateTask({ id: taskId, values: { status: statusValue } }));
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Task Board</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
            Drag tasks across columns to update their real status. Changes persist to MongoDB and broadcast live.
          </p>
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(180px,1fr))]">
          <input
            className="ghost-input"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          />

          <select
            className="ghost-select"
            value={filters.project}
            onChange={(event) => setFilters((current) => ({ ...current, project: event.target.value }))}
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
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
            <option value="dueDate">Due Date</option>
            <option value="updatedAt">Recently Updated</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </section>

      {status === "loading" && !tasks.length ? <LoadingScreen label="Loading board..." /> : null}

      {!tasks.length && status !== "loading" ? (
        <EmptyState
          title="No tasks on the board yet"
          description="Create your first task to start managing work across To Do, In Progress, Review, and Done."
          actionLabel="Create Task"
          onAction={() => setTaskModalOpen(true)}
        />
      ) : null}

      {tasks.length ? (
        <section className="overflow-x-auto">
          <div className="flex min-w-max gap-6 pb-4">
            {columns.map((column) => (
              <BoardColumn
                key={column.key}
                title={column.title}
                dotClassName={column.dotClassName}
                tasks={groupedTasks[column.key]}
                onDropTask={(taskId) => moveTask(taskId, column.key)}
                onEditTask={setEditingTask}
                onCreateTask={() => setTaskModalOpen(true)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <TaskFormModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        team={team}
        loading={busy}
        defaultProjectId={filters.project !== "all" ? filters.project : ""}
      />

      <TaskFormModal
        open={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        projects={projects}
        team={team}
        initialValues={editingTask}
        loading={busy}
      />
    </div>
  );
}

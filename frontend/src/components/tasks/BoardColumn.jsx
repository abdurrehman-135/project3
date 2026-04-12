import { MoreHorizontal, Plus } from "lucide-react";

import { StatusBadge } from "../common/StatusBadge";
import { formatDate, getInitials } from "../../utils/formatters";

export function BoardColumn({ title, dotClassName, tasks, onDropTask, onEditTask, onCreateTask }) {
  return (
    <div className="flex w-[320px] shrink-0 flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dotClassName}`} />
          <h3 className="font-bold tracking-tight">{title}</h3>
          <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-xs font-bold text-on-surface-variant">
            {tasks.length}
          </span>
        </div>
        <button type="button" className="rounded-full p-2 text-on-surface-variant transition hover:text-primary">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const taskId = event.dataTransfer.getData("taskId");
          if (taskId) {
            onDropTask(taskId);
          }
        }}
        className="min-h-[420px] rounded-3xl bg-surface-container-low p-3"
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <button
              key={task._id}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("taskId", task._id)}
              onClick={() => onEditTask(task)}
              type="button"
              className="surface-card w-full p-4 text-left transition hover:-translate-y-0.5"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <StatusBadge value={task.priority} />
                <span className="text-xs text-on-surface-variant">{task.project?.name}</span>
              </div>
              <h4 className="font-semibold leading-6">{task.title}</h4>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-on-surface-variant">
                {task.description || "No description yet."}
              </p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-medium text-on-surface-variant">{formatDate(task.dueDate, "MMM d")}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high text-xs font-bold text-primary">
                  {task.assignee?.name ? getInitials(task.assignee.name) : "NA"}
                </div>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={onCreateTask}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/40 py-4 text-sm font-semibold text-on-surface-variant transition hover:border-primary/30 hover:bg-white/70 hover:text-primary"
          >
            <Plus size={16} />
            Add new task
          </button>
        </div>
      </div>
    </div>
  );
}

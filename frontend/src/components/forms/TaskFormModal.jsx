import { useEffect, useMemo, useState } from "react";

import { Modal } from "../common/Modal";
import { PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../../utils/constants";

const initialState = {
  title: "",
  description: "",
  project: "",
  assignee: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  tags: "",
  subtasks: "",
};

export function TaskFormModal({
  open,
  onClose,
  onSubmit,
  projects = [],
  team = [],
  initialValues,
  loading,
  defaultProjectId = "",
}) {
  const [values, setValues] = useState(initialState);
  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === values.project),
    [projects, values.project]
  );

  useEffect(() => {
    if (open) {
      setValues(
        initialValues
          ? {
              ...initialState,
              ...initialValues,
              project: initialValues.project?._id || initialValues.project || defaultProjectId,
              assignee: initialValues.assignee?._id || initialValues.assignee || "",
              dueDate: initialValues.dueDate ? initialValues.dueDate.slice(0, 10) : "",
              tags: initialValues.tags?.join(", ") || "",
              subtasks: initialValues.subtasks?.map((item) => item.title).join("\n") || "",
            }
          : { ...initialState, project: defaultProjectId }
      );
      setError("");
    }
  }, [defaultProjectId, initialValues, open]);

  const availableMembers = selectedProject?.members || team;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.title.trim() || !values.project) {
      setError("Task title and project are required.");
      return;
    }

    setError("");
    const existingSubtasks = initialValues?.subtasks || [];

    await onSubmit({
      ...values,
      assignee: values.assignee || null,
      dueDate: values.dueDate || null,
      tags: values.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      subtasks: values.subtasks
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((title, index) => ({
          _id: existingSubtasks[index]?._id,
          title,
          completed: existingSubtasks[index]?.completed || false,
        })),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValues ? "Edit task" : "Create a task"}
      description="Bring the board, calendar, notifications, and detail views to life from one real record."
      wide
    >
      <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-5 md:col-span-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Task title</label>
            <input
              className="ghost-input"
              value={values.title}
              onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
              placeholder="Refine typography scale"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              className="ghost-input min-h-32 resize-none"
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              placeholder="Capture the outcome, context, and notes for this task."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Project</label>
          <select
            className="ghost-select"
            value={values.project}
            onChange={(event) => setValues((current) => ({ ...current, project: event.target.value, assignee: "" }))}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Assignee</label>
          <select
            className="ghost-select"
            value={values.assignee}
            onChange={(event) => setValues((current) => ({ ...current, assignee: event.target.value }))}
          >
            <option value="">Unassigned</option>
            {availableMembers.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Status</label>
          <select
            className="ghost-select"
            value={values.status}
            onChange={(event) => setValues((current) => ({ ...current, status: event.target.value }))}
          >
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Priority</label>
          <select
            className="ghost-select"
            value={values.priority}
            onChange={(event) => setValues((current) => ({ ...current, priority: event.target.value }))}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Due date</label>
          <input
            type="date"
            className="ghost-input"
            value={values.dueDate}
            onChange={(event) => setValues((current) => ({ ...current, dueDate: event.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Tags</label>
          <input
            className="ghost-input"
            value={values.tags}
            onChange={(event) => setValues((current) => ({ ...current, tags: event.target.value }))}
            placeholder="design-system, mobile, priority"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-semibold">Subtasks</label>
          <textarea
            className="ghost-input min-h-28 resize-none"
            value={values.subtasks}
            onChange={(event) => setValues((current) => ({ ...current, subtasks: event.target.value }))}
            placeholder={"Audit heading scale\nCreate contrast checklist\nQA mobile padding"}
          />
        </div>

        {error ? <p className="text-sm font-medium text-error md:col-span-2">{error}</p> : null}

        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Saving..." : initialValues ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect, useState } from "react";

import { Modal } from "../common/Modal";
import { PRIORITY_OPTIONS, PROJECT_COLORS, PROJECT_STATUS_OPTIONS } from "../../utils/constants";

const initialState = {
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  dueDate: "",
  budget: "",
  category: "General",
  color: "indigo",
  members: [],
};

export function ProjectFormModal({ open, onClose, onSubmit, team = [], initialValues, loading }) {
  const [values, setValues] = useState(initialState);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setValues(
        initialValues
          ? {
              ...initialState,
              ...initialValues,
              dueDate: initialValues.dueDate ? initialValues.dueDate.slice(0, 10) : "",
              members: initialValues.members?.map((member) => member._id) || [],
            }
          : initialState
      );
      setError("");
    }
  }, [initialValues, open]);

  const toggleMember = (id) => {
    setValues((current) => ({
      ...current,
      members: current.members.includes(id)
        ? current.members.filter((memberId) => memberId !== id)
        : [...current.members, id],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.name.trim()) {
      setError("Project name is required.");
      return;
    }

    setError("");
    await onSubmit({
      ...values,
      budget: values.budget ? Number(values.budget) : 0,
      dueDate: values.dueDate || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialValues ? "Edit project" : "Create a project"}
      description="Build a living workspace with real collaborators, timelines, and progress."
      wide
    >
      <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
        <div className="space-y-5 md:col-span-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Project name</label>
            <input
              className="ghost-input"
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              placeholder="Modernist Villa Redesign"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              className="ghost-input min-h-32 resize-none"
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              placeholder="Define scope, outcomes, and the narrative behind this project."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Status</label>
          <select
            className="ghost-select"
            value={values.status}
            onChange={(event) => setValues((current) => ({ ...current, status: event.target.value }))}
          >
            {PROJECT_STATUS_OPTIONS.map((option) => (
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
          <label className="text-sm font-semibold">Budget</label>
          <input
            type="number"
            min="0"
            className="ghost-input"
            value={values.budget}
            onChange={(event) => setValues((current) => ({ ...current, budget: event.target.value }))}
            placeholder="120000"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Category</label>
          <input
            className="ghost-input"
            value={values.category}
            onChange={(event) => setValues((current) => ({ ...current, category: event.target.value }))}
            placeholder="Architecture"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold">Accent color</label>
          <select
            className="ghost-select"
            value={values.color}
            onChange={(event) => setValues((current) => ({ ...current, color: event.target.value }))}
          >
            {PROJECT_COLORS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 md:col-span-2">
          <label className="text-sm font-semibold">Team members</label>
          <div className="grid gap-3 md:grid-cols-2">
            {team.map((member) => (
              <button
                key={member._id}
                type="button"
                onClick={() => toggleMember(member._id)}
                className={`rounded-2xl p-4 text-left transition ${
                  values.members.includes(member._id)
                    ? "bg-primary/8 text-primary ring-2 ring-primary/15"
                    : "bg-surface-container-low hover:bg-surface-container-high"
                }`}
              >
                <p className="font-semibold">{member.name}</p>
                <p className="text-xs text-on-surface-variant">{member.title}</p>
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="text-sm font-medium text-error md:col-span-2">{error}</p> : null}

        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Saving..." : initialValues ? "Save Changes" : "Create Project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}


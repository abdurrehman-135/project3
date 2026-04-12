import Project from "../models/Project.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createActivity, createNotifications } from "../services/notificationService.js";
import { emitToUsers } from "../services/socketService.js";
import { buildMembershipQuery, isObjectId } from "../utils/queryHelpers.js";

const taskPopulate = [
  { path: "project", populate: { path: "members owner", select: "_id name email role title" } },
  { path: "assignee", select: "_id name email role title" },
  { path: "reporter", select: "_id name email role title" },
  { path: "comments.author", select: "_id name email role title" },
];

const getAccessibleProject = async (projectId, userId) =>
  Project.findOne({
    _id: projectId,
    ...buildMembershipQuery(userId),
  }).populate("owner members", "_id name email role title");

export const getTasks = asyncHandler(async (req, res) => {
  const { project, status, priority, search, sort = "dueDate", from, to } = req.query;

  const accessibleProjects = await Project.find(buildMembershipQuery(req.user._id)).select("_id");
  const projectIds = accessibleProjects.map((item) => item._id);

  const filter = {
    project: { $in: projectIds },
  };

  if (project && project !== "all") {
    filter.project = project;
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  if (priority && priority !== "all") {
    filter.priority = priority;
  }

  if (search?.trim()) {
    filter.$text = { $search: search.trim() };
  }

  if (from || to) {
    filter.dueDate = {};
    if (from) filter.dueDate.$gte = new Date(from);
    if (to) filter.dueDate.$lte = new Date(to);
  }

  const sortMap = {
    dueDate: { dueDate: 1, updatedAt: -1 },
    priority: { priority: -1, updatedAt: -1 },
    updatedAt: { updatedAt: -1 },
    title: { title: 1 },
  };

  const tasks = await Task.find(filter)
    .populate(taskPopulate)
    .sort(sortMap[sort] || sortMap.dueDate);

  res.json({ tasks });
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate(taskPopulate);

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  const project = await getAccessibleProject(task.project._id, req.user._id);

  if (!project) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  res.json({ task });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, project: projectId, assignee, tags = [], subtasks = [] } = req.body;

  if (!title?.trim() || !projectId) {
    const error = new Error("Task title and project are required.");
    error.statusCode = 400;
    throw error;
  }

  const project = await getAccessibleProject(projectId, req.user._id);

  if (!project) {
    const error = new Error("Project not found.");
    error.statusCode = 404;
    throw error;
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: dueDate || null,
    project: project._id,
    assignee: isObjectId(assignee) ? assignee : null,
    reporter: req.user._id,
    tags,
    subtasks: subtasks.filter((item) => item.title?.trim()),
  });

  const populatedTask = await Task.findById(task._id).populate(taskPopulate);

  await createActivity({
    actorId: req.user._id,
    type: "task",
    message: `${req.user.name} created ${task.title}.`,
    projectId: project._id,
    taskId: task._id,
  });

  await createNotifications({
    userIds: [task.assignee, ...project.members, project.owner],
    type: "task",
    title: "Task created",
    message: `${task.title} was added to ${project.name}.`,
    link: `/tasks/${task._id}`,
  });

  emitToUsers([task.assignee, ...project.members, project.owner], "task:created", populatedTask);

  res.status(201).json({ task: populatedTask });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate("project");

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  const project = await getAccessibleProject(task.project._id, req.user._id);

  if (!project) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  const previousAssignee = task.assignee?.toString();
  const previousStatus = task.status;

  task.title = req.body.title ?? task.title;
  task.description = req.body.description ?? task.description;
  task.status = req.body.status ?? task.status;
  task.priority = req.body.priority ?? task.priority;
  if ("dueDate" in req.body) {
    task.dueDate = req.body.dueDate || null;
  }
  task.assignee =
    req.body.assignee === null ? null : isObjectId(req.body.assignee) ? req.body.assignee : task.assignee;
  task.tags = Array.isArray(req.body.tags) ? req.body.tags : task.tags;
  task.subtasks = Array.isArray(req.body.subtasks)
    ? req.body.subtasks.filter((item) => item.title?.trim())
    : task.subtasks;

  await task.save();

  await createActivity({
    actorId: req.user._id,
    type: "task",
    message:
      previousStatus !== task.status
        ? `${req.user.name} moved ${task.title} to ${task.status.replace("-", " ")}.`
        : `${req.user.name} updated ${task.title}.`,
    projectId: project._id,
    taskId: task._id,
  });

  if (task.assignee && task.assignee.toString() !== previousAssignee) {
    await createNotifications({
      userIds: [task.assignee],
      type: "task",
      title: "Task assigned",
      message: `${req.user.name} assigned you to ${task.title}.`,
      link: `/tasks/${task._id}`,
    });
  }

  const populatedTask = await Task.findById(task._id).populate(taskPopulate);

  emitToUsers([task.assignee, previousAssignee, ...project.members, project.owner], "task:updated", populatedTask);

  res.json({ task: populatedTask });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate("project");

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  const project = await getAccessibleProject(task.project._id, req.user._id);

  if (!project) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  await task.deleteOne();

  await createActivity({
    actorId: req.user._id,
    type: "task",
    message: `${req.user.name} deleted ${task.title}.`,
    projectId: project._id,
  });

  emitToUsers([task.assignee, ...project.members, project.owner], "task:deleted", {
    _id: req.params.id,
    projectId: project._id,
  });

  res.json({ message: "Task deleted successfully." });
});

export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    const error = new Error("Comment content is required.");
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findById(req.params.id).populate("project");

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  const project = await getAccessibleProject(task.project._id, req.user._id);

  if (!project) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  task.comments.push({
    author: req.user._id,
    content,
  });

  await task.save();

  await createActivity({
    actorId: req.user._id,
    type: "comment",
    message: `${req.user.name} commented on ${task.title}.`,
    projectId: project._id,
    taskId: task._id,
  });

  await createNotifications({
    userIds: [task.assignee, task.reporter, ...project.members],
    type: "comment",
    title: "New comment",
    message: `${req.user.name} commented on ${task.title}.`,
    link: `/tasks/${task._id}`,
  });

  const populatedTask = await Task.findById(task._id).populate(taskPopulate);

  emitToUsers([task.assignee, task.reporter, ...project.members, project.owner], "task:updated", populatedTask);

  res.status(201).json({ task: populatedTask });
});

export const toggleSubtask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate("project");

  if (!task) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  const project = await getAccessibleProject(task.project._id, req.user._id);

  if (!project) {
    const error = new Error("Task not found.");
    error.statusCode = 404;
    throw error;
  }

  const subtask = task.subtasks.id(req.params.subtaskId);

  if (!subtask) {
    const error = new Error("Subtask not found.");
    error.statusCode = 404;
    throw error;
  }

  subtask.completed = !subtask.completed;
  await task.save();

  await createActivity({
    actorId: req.user._id,
    type: "task",
    message: `${req.user.name} updated a subtask in ${task.title}.`,
    projectId: project._id,
    taskId: task._id,
  });

  const populatedTask = await Task.findById(task._id).populate(taskPopulate);

  emitToUsers([task.assignee, task.reporter, ...project.members, project.owner], "task:updated", populatedTask);

  res.json({ task: populatedTask });
});

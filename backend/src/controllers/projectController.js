import Activity from "../models/Activity.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createActivity, createNotifications } from "../services/notificationService.js";
import { emitToUsers } from "../services/socketService.js";
import { buildMembershipQuery, isObjectId, normalizeSearch, uniqueObjectIds } from "../utils/queryHelpers.js";

const populateProject = [
  { path: "owner", select: "_id name email role title" },
  { path: "members", select: "_id name email role title" },
];

const attachProjectMetrics = async (projects) => {
  const projectIds = projects.map((project) => project._id);

  if (!projectIds.length) {
    return [];
  }

  const summary = await Task.aggregate([
    {
      $match: {
        project: { $in: projectIds },
      },
    },
    {
      $group: {
        _id: {
          project: "$project",
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const metricsMap = new Map();

  summary.forEach((item) => {
    const projectId = item._id.project.toString();
    const current =
      metricsMap.get(projectId) || {
        totalTasks: 0,
        completedTasks: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        reviewTasks: 0,
      };

    current.totalTasks += item.count;

    if (item._id.status === "done") current.completedTasks += item.count;
    if (item._id.status === "todo") current.todoTasks += item.count;
    if (item._id.status === "in-progress") current.inProgressTasks += item.count;
    if (item._id.status === "review") current.reviewTasks += item.count;

    metricsMap.set(projectId, current);
  });

  return projects.map((project) => {
    const metrics = metricsMap.get(project._id.toString()) || {
      totalTasks: 0,
      completedTasks: 0,
      todoTasks: 0,
      inProgressTasks: 0,
      reviewTasks: 0,
    };

    return {
      ...project.toJSON(),
      metrics: {
        ...metrics,
        progress: metrics.totalTasks ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0,
      },
    };
  });
};

export const getProjects = asyncHandler(async (req, res) => {
  const { status, priority, search = "", sort = "updatedAt" } = req.query;

  const filter = {
    ...buildMembershipQuery(req.user._id),
  };

  if (status && status !== "all") {
    filter.status = status;
  }

  if (priority && priority !== "all") {
    filter.priority = priority;
  }

  const searchTerm = normalizeSearch(search);
  if (searchTerm) {
    filter.$text = { $search: searchTerm };
  }

  const sortMap = {
    updatedAt: { updatedAt: -1 },
    dueDate: { dueDate: 1, updatedAt: -1 },
    name: { name: 1 },
    priority: { priority: -1, updatedAt: -1 },
  };

  const projects = await Project.find(filter)
    .populate(populateProject)
    .sort(sortMap[sort] || sortMap.updatedAt);

  res.json({
    projects: await attachProjectMetrics(projects),
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    ...buildMembershipQuery(req.user._id),
  }).populate(populateProject);

  if (!project) {
    const error = new Error("Project not found.");
    error.statusCode = 404;
    throw error;
  }

  const tasks = await Task.find({ project: project._id })
    .populate("assignee", "_id name email role title")
    .populate("reporter", "_id name email role title")
    .sort({ dueDate: 1, updatedAt: -1 });

  const recentActivity = await Activity.find({ project: project._id })
    .populate("actor", "_id name email role title")
    .sort({ createdAt: -1 })
    .limit(8);

  const [projectWithMetrics] = await attachProjectMetrics([project]);

  res.json({
    project: projectWithMetrics,
    tasks,
    recentActivity,
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, status, priority, dueDate, budget, category, color, members = [] } = req.body;

  if (!name?.trim()) {
    const error = new Error("Project name is required.");
    error.statusCode = 400;
    throw error;
  }

  const memberIds = uniqueObjectIds([req.user._id, ...members].filter(isObjectId));

  const project = await Project.create({
    name,
    description,
    status,
    priority,
    dueDate: dueDate || null,
    budget: Number(budget) || 0,
    category: category || "General",
    color: color || "indigo",
    owner: req.user._id,
    members: memberIds,
  });

  await createActivity({
    actorId: req.user._id,
    type: "project",
    message: `${req.user.name} created ${project.name}.`,
    projectId: project._id,
  });

  await createNotifications({
    userIds: memberIds,
    type: "project",
    title: "New project created",
    message: `${project.name} is now in your workspace.`,
    link: `/projects/${project._id}`,
  });

  const populatedProject = await Project.findById(project._id).populate(populateProject);
  const [projectWithMetrics] = await attachProjectMetrics([populatedProject]);

  emitToUsers(memberIds, "project:created", projectWithMetrics);

  res.status(201).json({ project: projectWithMetrics });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    ...buildMembershipQuery(req.user._id),
  });

  if (!project) {
    const error = new Error("Project not found.");
    error.statusCode = 404;
    throw error;
  }

  const memberIds = uniqueObjectIds([project.owner, ...(req.body.members || project.members)].filter(isObjectId));

  project.name = req.body.name ?? project.name;
  project.description = req.body.description ?? project.description;
  project.status = req.body.status ?? project.status;
  project.priority = req.body.priority ?? project.priority;
  if ("dueDate" in req.body) {
    project.dueDate = req.body.dueDate || null;
  }
  project.budget = req.body.budget ?? project.budget;
  project.category = req.body.category ?? project.category;
  project.color = req.body.color ?? project.color;
  project.members = memberIds;

  await project.save();

  await createActivity({
    actorId: req.user._id,
    type: "project",
    message: `${req.user.name} updated ${project.name}.`,
    projectId: project._id,
  });

  const populatedProject = await Project.findById(project._id).populate(populateProject);
  const [projectWithMetrics] = await attachProjectMetrics([populatedProject]);

  emitToUsers(memberIds, "project:updated", projectWithMetrics);

  res.json({ project: projectWithMetrics });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });

  if (!project) {
    const error = new Error("Only the project owner can delete this project.");
    error.statusCode = 404;
    throw error;
  }

  await Task.deleteMany({ project: project._id });
  await Activity.deleteMany({ project: project._id });
  await project.deleteOne();

  emitToUsers([project.owner, ...project.members], "project:deleted", { _id: req.params.id });

  res.json({ message: "Project deleted successfully." });
});

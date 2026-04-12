import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import { buildMembershipQuery } from "../utils/queryHelpers.js";

const buildVelocityRange = () => {
  const dates = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    day.setHours(0, 0, 0, 0);
    dates.push(day);
  }

  return dates;
};

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const visibleProjects = await Project.find(buildMembershipQuery(req.user._id))
    .select("_id name status priority dueDate owner members category color createdAt updatedAt")
    .populate("owner members", "_id name email role title");

  const projectIds = visibleProjects.map((project) => project._id);

  const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
  const inProgressTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: "in-progress",
  });
  const completedTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: "done",
  });
  const overdueTasks = await Task.countDocuments({
    project: { $in: projectIds },
    status: { $ne: "done" },
    dueDate: { $lt: new Date() },
  });

  const taskSummary = await Task.aggregate([
    {
      $match: {
        project: { $in: projectIds },
      },
    },
    {
      $group: {
        _id: "$project",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", "done"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const taskSummaryMap = new Map(
    taskSummary.map((item) => [
      item._id.toString(),
      {
        totalTasks: item.totalTasks,
        completedTasks: item.completedTasks,
        progress: item.totalTasks ? Math.round((item.completedTasks / item.totalTasks) * 100) : 0,
      },
    ])
  );

  const upcomingTasks = await Task.find({
    project: { $in: projectIds },
    status: { $ne: "done" },
  })
    .populate("assignee", "_id name email role title")
    .populate("project", "_id name color")
    .sort({ dueDate: 1, updatedAt: -1 })
    .limit(6);

  const recentActivity = await Activity.find({
    $or: [{ project: { $in: projectIds } }, { actor: req.user._id }],
  })
    .populate("actor", "_id name email role title")
    .sort({ createdAt: -1 })
    .limit(6);

  const unreadNotifications = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  const velocityDates = buildVelocityRange();
  const projectVelocity = await Promise.all(
    velocityDates.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const count = await Task.countDocuments({
        project: { $in: projectIds },
        status: "done",
        updatedAt: {
          $gte: day,
          $lt: nextDay,
        },
      });

      return {
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        value: count,
      };
    })
  );

  res.json({
    stats: {
      totalTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      activeProjects: visibleProjects.length,
      unreadNotifications,
    },
    projectVelocity,
    activeProjects: visibleProjects.slice(0, 4).map((project) => ({
      ...project.toJSON(),
      metrics: taskSummaryMap.get(project._id.toString()) || {
        totalTasks: 0,
        completedTasks: 0,
        progress: 0,
      },
    })),
    upcomingTasks,
    recentActivity,
  });
});

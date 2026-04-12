import Task from "../models/Task.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getTeam = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: 1 });

  const userIds = users.map((user) => user._id);

  const taskCounts = await Task.aggregate([
    {
      $match: {
        assignee: { $in: userIds },
      },
    },
    {
      $group: {
        _id: "$assignee",
        openTasks: {
          $sum: {
            $cond: [{ $ne: ["$status", "done"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const taskCountMap = new Map(taskCounts.map((item) => [item._id.toString(), item.openTasks]));

  res.json({
    users: users.map((user) => ({
      ...user.toJSON(),
      openTasks: taskCountMap.get(user._id.toString()) || 0,
    })),
  });
});

import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";
import { emitToUsers } from "./socketService.js";

const toUserId = (value) => {
  if (!value) {
    return null;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
};

export const createActivity = async ({ actorId, type, message, projectId = null, taskId = null }) =>
  Activity.create({
    actor: actorId,
    type,
    message,
    project: projectId,
    task: taskId,
  });

export const createNotifications = async ({ userIds = [], type, title, message, link = "" }) => {
  const uniqueUserIds = [...new Set(userIds.map(toUserId).filter(Boolean))];

  if (!uniqueUserIds.length) {
    return [];
  }

  const notifications = await Notification.insertMany(
    uniqueUserIds.map((userId) => ({
      user: userId,
      type,
      title,
      message,
      link,
    }))
  );

  notifications.forEach((notification) => {
    emitToUsers([notification.user], "notification:new", notification);
  });

  return notifications;
};

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { fetchDashboardOverview } from "../features/dashboard/dashboardSlice";
import { prependNotification } from "../features/notifications/notificationsSlice";
import {
  fetchProjectById,
  removeProjectFromSocket,
  upsertProjectFromSocket,
} from "../features/projects/projectsSlice";
import { fetchTaskById, removeTaskFromSocket, upsertTaskFromSocket } from "../features/tasks/tasksSlice";
import { connectSocket, disconnectSocket } from "../services/socket";

export const useSocketEvents = (token) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return undefined;
    }

    const socket = connectSocket(token);

    if (!socket) {
      return undefined;
    }

    const currentProjectId = location.pathname.startsWith("/projects/")
      ? location.pathname.split("/")[2]
      : null;
    const currentTaskId = location.pathname.startsWith("/tasks/") && location.pathname !== "/tasks/board"
      ? location.pathname.split("/")[2]
      : null;

    const refreshDashboard = () => {
      dispatch(fetchDashboardOverview());
    };

    const onNotification = (notification) => {
      dispatch(prependNotification(notification));
      refreshDashboard();
    };

    const onProjectUpsert = (project) => {
      dispatch(upsertProjectFromSocket(project));
      if (currentProjectId && currentProjectId === project._id) {
        dispatch(fetchProjectById(project._id));
      }
      refreshDashboard();
    };

    const onProjectDelete = (payload) => {
      dispatch(removeProjectFromSocket(payload));
      if (currentProjectId && currentProjectId === payload._id) {
        navigate("/projects");
      }
      refreshDashboard();
    };

    const onTaskUpsert = (task) => {
      dispatch(upsertTaskFromSocket(task));

      if (currentTaskId && currentTaskId === task._id) {
        dispatch(fetchTaskById(task._id));
      }

      if (currentProjectId && task.project?._id === currentProjectId) {
        dispatch(fetchProjectById(currentProjectId));
      }

      refreshDashboard();
    };

    const onTaskDelete = (payload) => {
      dispatch(removeTaskFromSocket(payload));

      if (currentTaskId && currentTaskId === payload._id) {
        navigate("/tasks/board");
      }

      if (currentProjectId && currentProjectId === payload.projectId) {
        dispatch(fetchProjectById(currentProjectId));
      }

      refreshDashboard();
    };

    socket.on("notification:new", onNotification);
    socket.on("project:created", onProjectUpsert);
    socket.on("project:updated", onProjectUpsert);
    socket.on("project:deleted", onProjectDelete);
    socket.on("task:created", onTaskUpsert);
    socket.on("task:updated", onTaskUpsert);
    socket.on("task:deleted", onTaskDelete);

    return () => {
      socket.off("notification:new", onNotification);
      socket.off("project:created", onProjectUpsert);
      socket.off("project:updated", onProjectUpsert);
      socket.off("project:deleted", onProjectDelete);
      socket.off("task:created", onTaskUpsert);
      socket.off("task:updated", onTaskUpsert);
      socket.off("task:deleted", onTaskDelete);
    };
  }, [dispatch, location.pathname, navigate, token]);
};


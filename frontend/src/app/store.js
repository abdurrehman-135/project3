import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import projectsReducer from "../features/projects/projectsSlice";
import tasksReducer from "../features/tasks/tasksSlice";
import teamReducer from "../features/team/teamSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    notifications: notificationsReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    team: teamReducer,
  },
});


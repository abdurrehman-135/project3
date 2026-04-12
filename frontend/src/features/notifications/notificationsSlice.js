import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, getApiError } from "../../services/api";

export const fetchNotifications = createAsyncThunk("notifications/fetchNotifications", async (_, thunkApi) => {
  try {
    const { data } = await api.get("/notifications");
    return data.notifications;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to load notifications."));
  }
});

export const markNotificationRead = createAsyncThunk(
  "notifications/markNotificationRead",
  async (notificationId, thunkApi) => {
    try {
      const { data } = await api.patch(`/notifications/${notificationId}/read`);
      return data.notification;
    } catch (error) {
      return thunkApi.rejectWithValue(getApiError(error, "Unable to update notification."));
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllNotificationsRead",
  async (_, thunkApi) => {
    try {
      await api.patch("/notifications/read-all");
      return true;
    } catch (error) {
      return thunkApi.rejectWithValue(getApiError(error, "Unable to clear notifications."));
    }
  }
);

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    prependNotification: (state, action) => {
      state.items = [action.payload, ...state.items.filter((item) => item._id !== action.payload._id)].slice(0, 30);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item._id === action.payload._id ? action.payload : item));
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({ ...item, read: true }));
      });
  },
});

export const { prependNotification } = notificationsSlice.actions;

export default notificationsSlice.reducer;

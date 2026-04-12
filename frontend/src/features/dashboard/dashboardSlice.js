import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, getApiError } from "../../services/api";

export const fetchDashboardOverview = createAsyncThunk(
  "dashboard/fetchDashboardOverview",
  async (_, thunkApi) => {
    try {
      const { data } = await api.get("/dashboard/overview");
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(getApiError(error, "Unable to load dashboard."));
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: null,
    projectVelocity: [],
    activeProjects: [],
    upcomingTasks: [],
    recentActivity: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.stats = action.payload.stats;
        state.projectVelocity = action.payload.projectVelocity;
        state.activeProjects = action.payload.activeProjects;
        state.upcomingTasks = action.payload.upcomingTasks;
        state.recentActivity = action.payload.recentActivity;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;

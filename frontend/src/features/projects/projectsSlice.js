import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, getApiError } from "../../services/api";

const upsert = (items, nextItem) => [nextItem, ...items.filter((item) => item._id !== nextItem._id)];

export const fetchProjects = createAsyncThunk("projects/fetchProjects", async (params = {}, thunkApi) => {
  try {
    const { data } = await api.get("/projects", { params });
    return data.projects;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to load projects."));
  }
});

export const fetchProjectById = createAsyncThunk("projects/fetchProjectById", async (projectId, thunkApi) => {
  try {
    const { data } = await api.get(`/projects/${projectId}`);
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to load project."));
  }
});

export const createProject = createAsyncThunk("projects/createProject", async (payload, thunkApi) => {
  try {
    const { data } = await api.post("/projects", payload);
    return data.project;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to create project."));
  }
});

export const updateProject = createAsyncThunk("projects/updateProject", async ({ id, values }, thunkApi) => {
  try {
    const { data } = await api.put(`/projects/${id}`, values);
    return data.project;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to update project."));
  }
});

export const deleteProject = createAsyncThunk("projects/deleteProject", async (id, thunkApi) => {
  try {
    await api.delete(`/projects/${id}`);
    return id;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to delete project."));
  }
});

const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    list: [],
    current: null,
    currentTasks: [],
    recentActivity: [],
    status: "idle",
    currentStatus: "idle",
    error: null,
  },
  reducers: {
    upsertProjectFromSocket: (state, action) => {
      state.list = upsert(state.list, action.payload);
      if (state.current?._id === action.payload._id) {
        state.current = action.payload;
      }
    },
    removeProjectFromSocket: (state, action) => {
      state.list = state.list.filter((item) => item._id !== action.payload._id);
      if (state.current?._id === action.payload._id) {
        state.current = null;
        state.currentTasks = [];
        state.recentActivity = [];
      }
    },
    clearCurrentProject: (state) => {
      state.current = null;
      state.currentTasks = [];
      state.recentActivity = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.currentStatus = "loading";
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload.project;
        state.currentTasks = action.payload.tasks;
        state.recentActivity = action.payload.recentActivity;
        state.list = upsert(state.list, action.payload.project);
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.list = upsert(state.list, action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.list = upsert(state.list, action.payload);
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
        if (state.current?._id === action.payload) {
          state.current = null;
          state.currentTasks = [];
          state.recentActivity = [];
        }
      });
  },
});

export const { upsertProjectFromSocket, removeProjectFromSocket, clearCurrentProject } = projectsSlice.actions;

export default projectsSlice.reducer;


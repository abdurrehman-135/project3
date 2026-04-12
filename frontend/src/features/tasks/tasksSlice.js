import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, getApiError } from "../../services/api";

const mergeTask = (tasks, nextTask) => [nextTask, ...tasks.filter((task) => task._id !== nextTask._id)];

export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (params = {}, thunkApi) => {
  try {
    const { data } = await api.get("/tasks", { params });
    return data.tasks;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to load tasks."));
  }
});

export const fetchTaskById = createAsyncThunk("tasks/fetchTaskById", async (taskId, thunkApi) => {
  try {
    const { data } = await api.get(`/tasks/${taskId}`);
    return data.task;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to load task."));
  }
});

export const createTask = createAsyncThunk("tasks/createTask", async (payload, thunkApi) => {
  try {
    const { data } = await api.post("/tasks", payload);
    return data.task;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to create task."));
  }
});

export const updateTask = createAsyncThunk("tasks/updateTask", async ({ id, values }, thunkApi) => {
  try {
    const { data } = await api.put(`/tasks/${id}`, values);
    return data.task;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to update task."));
  }
});

export const deleteTask = createAsyncThunk("tasks/deleteTask", async (id, thunkApi) => {
  try {
    await api.delete(`/tasks/${id}`);
    return id;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to delete task."));
  }
});

export const addComment = createAsyncThunk("tasks/addComment", async ({ id, content }, thunkApi) => {
  try {
    const { data } = await api.post(`/tasks/${id}/comments`, { content });
    return data.task;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to post comment."));
  }
});

export const toggleSubtask = createAsyncThunk("tasks/toggleSubtask", async ({ id, subtaskId }, thunkApi) => {
  try {
    const { data } = await api.patch(`/tasks/${id}/subtasks/${subtaskId}`);
    return data.task;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to update subtask."));
  }
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    list: [],
    current: null,
    status: "idle",
    currentStatus: "idle",
    error: null,
  },
  reducers: {
    upsertTaskFromSocket: (state, action) => {
      state.list = mergeTask(state.list, action.payload);
      if (state.current?._id === action.payload._id) {
        state.current = action.payload;
      }
    },
    removeTaskFromSocket: (state, action) => {
      state.list = state.list.filter((task) => task._id !== action.payload._id);
      if (state.current?._id === action.payload._id) {
        state.current = null;
      }
    },
    clearCurrentTask: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchTaskById.pending, (state) => {
        state.currentStatus = "loading";
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
        state.list = mergeTask(state.list, action.payload);
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.list = mergeTask(state.list, action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.list = mergeTask(state.list, action.payload);
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.list = mergeTask(state.list, action.payload);
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
      })
      .addCase(toggleSubtask.fulfilled, (state, action) => {
        state.list = mergeTask(state.list, action.payload);
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter((task) => task._id !== action.payload);
        if (state.current?._id === action.payload) {
          state.current = null;
        }
      });
  },
});

export const { upsertTaskFromSocket, removeTaskFromSocket, clearCurrentTask } = tasksSlice.actions;

export default tasksSlice.reducer;


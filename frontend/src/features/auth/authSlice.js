import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, getApiError } from "../../services/api";
import { disconnectSocket } from "../../services/socket";

const token = localStorage.getItem("taskflow_token");

export const login = createAsyncThunk("auth/login", async (payload, thunkApi) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("taskflow_token", data.token);
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to sign in."));
  }
});

export const register = createAsyncThunk("auth/register", async (payload, thunkApi) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("taskflow_token", data.token);
    return data;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to create account."));
  }
});

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, thunkApi) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.user;
  } catch (error) {
    localStorage.removeItem("taskflow_token");
    return thunkApi.rejectWithValue(getApiError(error, "Session expired."));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token,
    status: "idle",
    error: null,
    initialized: !token,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.initialized = true;
      localStorage.removeItem("taskflow_token");
      disconnectSocket();
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.initialized = true;
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.initialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.token = localStorage.getItem("taskflow_token");
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.user = null;
        state.token = null;
        state.error = action.payload;
        state.initialized = true;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export default authSlice.reducer;

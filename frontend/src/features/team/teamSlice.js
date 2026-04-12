import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api, getApiError } from "../../services/api";

export const fetchTeam = createAsyncThunk("team/fetchTeam", async (_, thunkApi) => {
  try {
    const { data } = await api.get("/users/team");
    return data.users;
  } catch (error) {
    return thunkApi.rejectWithValue(getApiError(error, "Unable to load your team."));
  }
});

const teamSlice = createSlice({
  name: "team",
  initialState: {
    users: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
        state.error = null;
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default teamSlice.reducer;


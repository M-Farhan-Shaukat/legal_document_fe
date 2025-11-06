import { LocalServerFD } from "@/app/utils";
import { getErrorMessage } from "@/app/utils/helper";
import ToastNotification from "@/app/utils/Toast";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const { ToastComponent } = ToastNotification;

export const profile = createAsyncThunk(
  "profile",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await LocalServerFD.post("/api/profile", userData);
      if (response?.data?.success) {
        return response.data;
      } else {
        ToastComponent("error", response?.data?.message);
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    image: null,
    loading: false,
    error: null,
  },
  reducers: {
    // Reducer to reset state when logging out
    resetAuthState: (state) => {
      state.image = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(profile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(profile.fulfilled, (state, action) => {
        state.loading = false;
        state.image = action.payload;
      })
      .addCase(profile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// export const { resetAuthState } = authSlice.actions;

export default profileSlice.reducer;

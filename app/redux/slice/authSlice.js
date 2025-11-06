// app/redux/slice/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { LocalServer } from "@/app/utils";
import { getErrorMessage } from "@/app/utils/helper";
import ToastNotification from "@/app/utils/Toast";
import { clearAuthCookies } from "@/app/utils/cookieManager";

const { ToastComponent } = ToastNotification;

// 🔑 Async Thunks – NO store imports here
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ userData, isAdmin }, { rejectWithValue }) => {
    try {
      const url = isAdmin ? "/api/signin" : "/api/usersignin";
      const response = await LocalServer.post(url, userData);

      if (response?.data?.success) {
        Cookies.set("role_id", response?.data?.user?.role_id);
        return response.data;
      } else {
        ToastComponent("error", response?.data?.message);
        return rejectWithValue(response?.data?.message);
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const processLoginData = createAsyncThunk(
  "auth/loginUser",
  async ({ userData }, { rejectWithValue }) => {
    try {
      // const url = isAdmin ? "/api/signin" : "/api/usersignin";
      const response = await LocalServer.post("/api/autoLogin", userData);

      if (response?.data?.success) {
        Cookies.set("role_id", response?.data?.user?.role_id);
        return response.data;
      } else {
        ToastComponent("error", response?.data?.message);
        return rejectWithValue(response?.data?.message);
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    localStorage.removeItem("persist:auth");
    localStorage.clear();
    sessionStorage.clear();

    // Use the centralized cookie clearing function
    clearAuthCookies();

    dispatch(resetAuthState());
  }
);

export const removeUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    localStorage.removeItem("persist:auth");
    // localStorage.clear();
    sessionStorage.clear();

    // Use the centralized cookie clearing function
    clearAuthCookies();

    dispatch(resetAuthState());
  }
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const response = await LocalServer.get(
        `/api/user/listing?page=1&view=20&search=&sortBy=created_at&orderBy=desc`
      );

      if (response?.data?.success) {
        dispatch(updateUserInfo(response.data));
        return response.data;
      } else {
        ToastComponent("error", response?.data?.message);
        return rejectWithValue(response?.data?.message);
      }
    } catch (error) {
      ToastComponent("error", getErrorMessage(error));
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    Tfa: false,
    message: "",
    auth_type: "",
    available_channels: [],
    try_another_way: false,
  },
  reducers: {
    resetAuthState: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      state.Tfa = false;
      state.message = "";
      state.auth_type = "";
      state.available_channels = [];
      state.try_another_way = false;
    },
    updateUserInfo: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          user: {
            ...state.user.user,
            name: action.payload.provider.name,
            image: action.payload.provider?.image,
          },
        };
      }
    },
    updateUserLocally: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      } else {
        state.user = action.payload;
        state.message = action.payload?.message;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.message = action.payload?.message;
        // state.auth_type = action.payload?.verified_through;
        // state.available_channels = action.payload?.available_channels;
        // state.try_another_way = action.payload?.try_another_way;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.Tfa = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          ...state.user,
          user: { ...state.user.user },
        };
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAuthState, updateUserInfo, updateUserLocally } =
  authSlice.actions;
export default authSlice.reducer;

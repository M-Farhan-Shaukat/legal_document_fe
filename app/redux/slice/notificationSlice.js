import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  hasNewNotification: false,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    addNotification: (state) => {
      state.hasNewNotification = true;
    },
    clearNotification: (state) => {
      state.hasNewNotification = false;
    },
  },
});

export const { addNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

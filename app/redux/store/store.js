// app/redux/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer, { logoutUser } from "../slice/authSlice"; // reducer only
import notificationReducer from "../slice/notificationSlice";
import { decryptData, encryptData } from "@/app/utils/crypto";
import { setupAxiosInterceptors } from "@/app/utils";

// Transform for encryption/decryption
const EncryptTransform = createTransform(
  (inboundState) => encryptData(inboundState),
  (outboundState) => decryptData(outboundState)
);

const persistConfig = {
  key: "auth",
  storage,
  transforms: [EncryptTransform],
};
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    user: persistedAuthReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
setupAxiosInterceptors(store, logoutUser);

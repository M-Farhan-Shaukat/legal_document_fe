"use client";
import { Provider } from "react-redux";
import ToastNotification from "./utils/Toast";
import { store, persistor } from "./redux/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { useEffect } from "react";

const { ToastContainer } = ToastNotification;

export const ReduxProvider = ({ children }) => {

  useEffect(() => {
  const onPageShow = (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  };
  window.addEventListener("pageshow", onPageShow);
  return () => window.removeEventListener("pageshow", onPageShow);
}, []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
      <ToastContainer />
    </Provider>
  );
};

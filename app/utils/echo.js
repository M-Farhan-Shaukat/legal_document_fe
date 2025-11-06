"use client";
import Pusher from "pusher-js";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Toast, ToastBody, ToastHeader } from "reactstrap";
import { addNotification } from "../redux/slice/notificationSlice";

const PusherClient = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const APPKEY = `${process.env.NEXT_PUBLIC_PUSHER_APP_KEY}`;
    const CLUSTER = `${process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER}`;

    if (!APPKEY || !CLUSTER) {
      console.warn("Pusher config missing");
      return;
    }

    const pusher = new Pusher(APPKEY, {
      cluster: CLUSTER,
      forceTLS: true,
    });

    const channel = pusher.subscribe("app-notifications");
    channel.bind("action.happened", (data) => {
      setToastMessage(data?.message || "Something happened");
      dispatch(addNotification());
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  const shouldShowToast =
    toastMessage &&
    ((user?.user?.business_id === toastMessage?.business_id &&
      user?.user?.id === toastMessage?.user_id &&
      toastMessage?.show_notification === user?.user?.role_slug) ||
      (toastMessage?.show_notification === "super_admin" &&
        user?.user?.role_slug === "super_admin"));

  return (
    <>
      {shouldShowToast && (
        <div
          style={{
            position: "fixed",
            bottom: "3rem",
            right: "1rem",
            zIndex: 9999,
          }}
        >
          <Toast isOpen>
            <ToastHeader style={{ background: "#1572e8", color: "#fff" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <h5>{toastMessage?.title}</h5>
                <h5
                  style={{ cursor: "pointer" }}
                  onClick={() => setToastMessage(null)}
                >
                  X
                </h5>
              </div>
            </ToastHeader>
            <ToastBody>{toastMessage?.message}</ToastBody>
          </Toast>
        </div>
      )}
    </>
  );
};

export default PusherClient;

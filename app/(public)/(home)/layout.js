"use client";
import { removeUser } from "@/app/redux/slice/authSlice";
import { Footer } from "@/app/shared";
import { clearAuthCookies } from "@/app/utils/cookieManager";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./questionnaire/question.scss";

const getClientSideCookie = (name) => {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return cookieValue;
};

export default function Privatelayout({ children }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const authToken = getClientSideCookie("authToken");

  useEffect(() => {
    if (!authToken) {
      clearAuthCookies();
      dispatch(removeUser());
      if (typeof window !== "undefined") {
        // localStorage.clear();
        sessionStorage.clear();
        if (user?.token) {
          window.confirm("Session expired. Please login again.");
          window.location.reload();
        }
      }
    }
  }, [authToken, user]);

  return (
    <>
      <div className="layout__container">
        <div>{children}</div>
      </div>
      {pathname !== "/get-started" && !pathname.includes("/questionnaire") && (
        <div className="layout__container--fluid">
          <Footer />
        </div>
      )}
    </>
  );
}

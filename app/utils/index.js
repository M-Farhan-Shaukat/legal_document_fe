import axios from "axios";
import ToastNotification from "./Toast";
import { clearAuthCookies } from "./cookieManager";
const { ToastComponent } = ToastNotification;

export const baseURL = `${process.env.BASEURL_BACKEND}`;

/**
 * Utility: Convert base64 string into a blob URL
 */
export const base64ToBlob = (base64, mimeType = null) => {
  const response = typeof base64 === "string" ? base64 : base64?.file;

  if (!response || typeof response !== "string" || !response.includes(",")) {
    console.error("Invalid base64 string or format:", response);
    return null;
  }

  // Extract MIME type from base64 string
  const matches = response.split(":")[1];
  const extractedMime = matches ? matches.split(";")[0] : null;
  const finalMimeType = mimeType || extractedMime || "application/octet-stream";

  try {
    // Remove metadata and decode base64
    const base64Data = response.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: finalMimeType,
    });

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Failed to decode base64:", error.message);
    return null;
  }
};

/**
 * API Clients
 */
const API = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

API.interceptors.request.use((config) => {
  return config;
});

export default API;

export const LocalServer = axios.create({
  baseURL: typeof window !== "undefined" ? `${window.origin}` : undefined,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    Accept: "application/json",
  },
});

export const LocalServerFD = axios.create({
  baseURL: typeof window !== "undefined" ? `${window.origin}` : undefined,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "multipart/form-data",
    Accept: "*/*",
  },
});

/**
 * Setup function to inject store + logoutUser AFTER Redux store is created
 */
export const setupAxiosInterceptors = (store, logoutUser) => {
  // JSON requests
  LocalServer.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        error.response.status === 401 &&
        !error.request.responseURL.includes("usersignin")
      ) {
        if (typeof window !== "undefined") {
          // Use centralized cookie clearing
          clearAuthCookies();
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/";
        }

        ToastComponent(
          "error",
          error.response.data?.message ||
            "Session expired. Please log in again."
        );
        store.dispatch(logoutUser());
      }

      return Promise.reject(
        error.response
          ? {
              message:
                error.response.data?.message || "The server is not responding",
              status: error.response.status,
            }
          : { message: error.message || "Network error" }
      );
    }
  );

  // Form-data requests
  LocalServerFD.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        if (typeof window !== "undefined") {
          // Use centralized cookie clearing
          clearAuthCookies();
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        }
        store.dispatch(logoutUser());
      }

      return Promise.reject(
        error.response
          ? {
              message: error.response.data?.message || "Unknown error",
              status: error.response.status,
            }
          : { message: error.message || "Network error" }
      );
    }
  );
};

export function sortData(data) {
  return data
    .map((item) => {
      if (item.type === "section" && Array.isArray(item.pages)) {
        return {
          ...item,
          pages: [...item.pages].sort(
            (a, b) => Number(a.page_order) - Number(b.page_order)
          ),
        };
      }
      return item;
    })
    .sort((a, b) => Number(a.root_order) - Number(b.root_order));
}

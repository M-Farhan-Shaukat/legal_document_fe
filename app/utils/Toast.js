"use client";
import React, { useState } from "react";
import { Toast, ToastBody, Button } from "reactstrap";
const ToastNotification = (() => {
  let setToast;

  // Helper function to process error messages
  const processErrorMessage = (message) => {
    // If message is a string, return as is
    if (typeof message === "string") {
      return message;
    }

    // If message is an object with error fields
    if (typeof message === "object" && message !== null) {
      const errorList = [];

      // Handle case where message has nested error objects
      for (const key in message) {
        const value = message[key];

        if (Array.isArray(value)) {
          // If value is an array, add all items
          errorList.push(...value);
        } else if (typeof value === "string") {
          // If value is a string, add it directly
          errorList.push(value);
        } else if (typeof value === "object" && value !== null) {
          // If value is an object, recursively process it
          const nestedErrors = processErrorMessage(value);
          if (nestedErrors) {
            errorList.push(nestedErrors);
          }
        }
      }

      // Return formatted error messages
      if (errorList.length > 0) {
        return errorList.length === 1
          ? errorList[0]
          : errorList
              .map((error, index) => `${index + 1}. ${error}`)
              .join("\n");
      }
    }

    return "The server is not responding";
  };

  const ToastComponent = (
    type = "success",
    message = "The server is not responding"
  ) => {
    if (setToast) {
      const processedMessage = processErrorMessage(message);
      setToast({ isOpen: true, type, message: processedMessage });

      setTimeout(
        () => setToast((prev) => ({ ...prev, isOpen: false })),
        type === "error" ? 10000 : 5000 // Longer duration for errors
      );
    }
  };

  const ToastContainer = () => {
    const [toast, _setToast] = useState({
      isOpen: false,
      type: "",
      message: "",
    });
    setToast = _setToast;

    const getStyle = () => {
      switch (toast.type) {
        case "success":
          return {
            backgroundColor: "#d1f3d2",
            color: "#14532d",
            border: "1px solid #14532d",
          };
        case "info":
          return {
            backgroundColor: "#dbeafe",
            color: "#1e3a8a",
            border: "1px solid #1e3a8a",
          };
        case "warning":
          return {
            backgroundColor: "#fef3c7",
            color: "#92400e",
            border: "1px solid #92400e",
          };
        case "error":
          return {
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #991b1b",
          };
        default:
          return {
            backgroundColor: "#f3f4f6",
            color: "#374151",
            border: "1px solid #374151",
          };
      }
    };

    return (
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
        <Toast
          isOpen={toast.isOpen}
          fade
          className={`rounded-lg shadow-md px-4 py-3 flex items-start gap-3`}
          style={{
            ...getStyle(), // spreads backgroundColor and color
            borderRadius: "8px",
            padding: "12px 16px",
            minWidth: "300px",
            display: "flex",
          }}
        >
          <Button close onClick={() => setToast({ isOpen: false })} />

          <ToastBody className="p-0">
            {toast.message && typeof toast.message === "string" ? (
              toast.message
                .split("\n")
                .map((line, index) => <div key={index}>{line}</div>)
            ) : (
              <div>{toast.message || "The server is not responding!"}</div>
            )}
          </ToastBody>
        </Toast>
      </div>
    );
  };

  return { ToastComponent, ToastContainer };
})();

export default ToastNotification;

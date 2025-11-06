"use client";

import React, { useState } from "react";

const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const handleReload = () => {
    setIsReloading(true);
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const copyErrorToClipboard = () => {
    const errorText = `
Error: ${error?.message || "Unknown error"}
Stack: ${error?.stack || "No stack trace"}
Component Stack: ${errorInfo?.componentStack || "No component stack"}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
    `.trim();

    navigator.clipboard
      .writeText(errorText)
      .then(() => {
        alert("Error details copied to clipboard");
      })
      .catch(() => {
        console.log("Failed to copy error details");
      });
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-center"
      style={{
        minHeight: "100vh",
        // background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
        padding: "2rem",
      }}
    >
      {/* Error Icon */}
      {/* <div className="mb-4">
    <svg
      width="120"
      height="120"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#dc3545"
      strokeWidth="1.5"
      className="mx-auto"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  </div> */}

      <h1 className="display-6 fw-bold text mb-3" style={{ fontSize: "16rem" }}>
        OOPS!
      </h1>
      {/* <p className="lead text-muted mb-4" style={{ maxWidth: "600px" }}>
    We encountered an unexpected error. Don’t worry, our team has been notified
    and we’re working to fix it.
  </p> */}

      <div className="d-flex flex-wrap justify-content-center gap-3 mb-4 ">
        {/* <button className="btn btn-primary" onClick={onReset} disabled={isReloading}>
      Try Again
    </button> */}

        <button
          className="btn btn-outline-secondary btn-lg"
          onClick={handleReload}
          disabled={isReloading}
        >
          {isReloading ? "Reloading..." : "Reload Page"}
        </button>

        <button
          className="btn btn-outline-primary btn-lg"
          onClick={handleGoHome}
        >
          Go Home
        </button>
      </div>

      {/* Toggle Error Details */}
      <div
        className="border-top pt-3"
        style={{ maxWidth: "700px", width: "100%" }}
      >
        {/* <button
      className="btn btn-link text-muted p-0 mb-3"
      onClick={() => setShowDetails(!showDetails)}
    >
      {showDetails ? "Hide" : "Show"} Error Details
    </button> */}

        {showDetails && (
          <div className="bg-white shadow-sm p-3 rounded text-start">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted fw-bold">Error Details:</small>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={copyErrorToClipboard}
              >
                Copy
              </button>
            </div>

            <div className="small text-monospace">
              <div className="mb-2">
                <strong>Message:</strong> {error?.message || "Unknown error"}
              </div>

              {error?.stack && (
                <div className="mb-2">
                  <strong>Stack Trace:</strong>
                  <pre
                    className="mt-1 text-wrap"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {error.stack}
                  </pre>
                </div>
              )}

              {errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre
                    className="mt-1 text-wrap"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* <div className="mt-4">
    <small className="text-muted">
      If this problem persists, please contact our support team.
    </small>
  </div> */}
    </div>
  );
};

export default ErrorFallback;

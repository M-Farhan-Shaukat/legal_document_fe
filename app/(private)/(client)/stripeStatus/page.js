"use client";
import { LocalServer } from "@/app/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "reactstrap";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("sessionId");
  const payment_token =
    typeof window !== "undefined"
      ? localStorage.getItem("payment_token")
      : null;

  const verifyPayment = async () => {
    try {
      const response = await LocalServer.post(
        "/api/document/client/verifyPayment",
        {
          sessionId: session_id,
          se_token: payment_token,
        }
      );

      // Clean up localStorage
      localStorage.removeItem("payment_token");
    } catch (error) {
      console.error("Error verifying payment:", error);
    }
  };

  useEffect(() => {
    if (session_id && payment_token) {
      // Send to backend using your existing method

      verifyPayment();
    }
  }, [session_id, payment_token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginTop: "1rem",
          }}
        >
          Payment Successful
        </h1>
        <p style={{ marginTop: "1rem" }}>Thank you for your purchase!</p>
        <Button
          style={{ marginTop: "1rem" }}
          onClick={() => router.push("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

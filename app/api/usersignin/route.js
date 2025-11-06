import API from "@/app/utils";
import { encryptData } from "@/app/utils/crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  const payload = await req.json();
  const url = "/login";

  try {
    const res = await API.post(url, payload);

    if (res) {
      const cookieStore = await cookies();
      if (res.data?.token) {
        cookieStore.set("authToken", encryptData(res.data?.token), {
          // httpOnly: true, // Prevent client-side JavaScript access
          secure: process.env.NODE_ENV === "production", // Only secure in production
          sameSite: "Strict",
          path: "/", // Available across the entire site
          maxAge: 60 * 60 * Number(process.env.COOKIES_EXPIRATION_HOURS), // 7 hours expiration
        });
        cookieStore.set("userType", encryptData(res.data?.user), {
          // httpOnly: true, // Prevent client-side JavaScript access
          secure: process.env.NODE_ENV === "production", // Only secure in production
          sameSite: "Strict",
          path: "/", // Available across the entire site
          maxAge: 60 * 60 * Number(process.env.COOKIES_EXPIRATION_HOURS), // 7 hours expiration
        });
      }

      return NextResponse.json({
        ...res.data,
        success: true,
      });
    }
  } catch (err) {
    if (err.response) {
      // The request was made and the server responded with a status code
      const { data, status } = err.response;
      // Create a custom response with error details in the header
      const errorMessage =
        data?.message ||
        data?.messages ||
        data?.error ||
        "An unexpected error occurred.";
      // Create a custom response with error details in the header
      return NextResponse.json(
        {
          message: errorMessage,
          success: false,
          status: status,
        },
        { status }
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      return NextResponse.json({
        message: "Error setting up the request",
        success: false,
      });
    }
  }
}

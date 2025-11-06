import API from "@/app/utils";
import { decryptData, encryptData } from "@/app/utils/crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  const payload = await req?.json();
  const cookieStore = await cookies();
  const access_token = decryptData(cookieStore.get("authToken")?.value);

  const userType = decryptData(cookieStore.get("userType")?.value);


  const url =
    payload?.from !== "super_admin"
      ? "/code_confirmation"
      : "/admin/code_confirmation";

  try {
    const res = await API.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Accept: "application/json",
        authorization: access_token ? `${access_token}` : "",
      },
    });

    if (res) {
      const cookieStore = cookies();
      cookieStore.set("authToken", encryptData(res.data?.token), {
        // httpOnly: true, // Prevent client-side JavaScript access
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: "Strict",
        path: "/", // Available across the entire site
        maxAge: 60 * 60 * Number(process.env.COOKIES_EXPIRATION_HOURS), // 7 hours expiration
      });
      cookieStore.set("userType", encryptData(res.data?.user?.role_slug), {
        // httpOnly: true, // Prevent client-side JavaScript access
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: "Strict",
        path: "/", // Available across the entire site
        maxAge: 60 * 60 * Number(process.env.COOKIES_EXPIRATION_HOURS), // 7 hours expiration
      });
      // cookieStore.set("twoFA", res.data?.["2fa"], {
      //   // httpOnly: true, // Prevent client-side JavaScript access
      //   secure: process.env.NODE_ENV === "production", // Only secure in production
      //   sameSite: "Strict",
      //   path: "/", // Available across the entire site
      //   maxAge: 60 * 60 * 24, // 7 days expiration
      // });

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
    } else if (err.request) {
      // The request was made but no response was received
      return NextResponse.json({
        message: "No response received from the server",
        success: false,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      return NextResponse.json({
        message: "Error setting up the request",
        success: false,
      });
    }
  }
}

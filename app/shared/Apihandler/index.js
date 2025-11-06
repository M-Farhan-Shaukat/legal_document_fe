import API from "@/app/utils";
import { cookies } from "next/headers";
import { decryptData } from "@/app/utils/crypto";
import { NextResponse } from "next/server";

export async function apiHandler({
  url,
  method = "GET",
  params = {},
  headers = {},
  payload = null,
  requireAuth = true, // Add a flag to determine if authentication is required
}) {
  try {
    // Fetch session and access token if authentication is required
    let access_token = null;
    if (requireAuth) {
      const cookieStore = await cookies();
      access_token = decryptData(cookieStore.get("authToken")?.value);
    }
    // Set up the request configuration
    const config = {
      method,
      url,
      params,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Accept: "application/json",
        ...(access_token
          ? { authorization: `${access_token}` }
          : { authorization: `` }),
        ...headers,
      },
      ...(payload && { data: payload }),
    };

    // Make the API call
    const response = await API(config);
    // Return a successful response
    if (response) {
      return NextResponse.json({
        ...response.data,
        message: response?.data?.message,
        success: true,
      });
    }
  } catch (err) {
    if (err.response) {
      // The request was made and the server responded with a status code
      const { data, status } = err.response;

      // Create a custom response with error details in the header
      const errorResponse = NextResponse.json(
        {
          message: data?.error || data?.message,
          success: false,
          status: status,
        },
        { status }
      );

      // Add error details to the response header
      errorResponse.headers.set(
        "X-Error-Message",
        data?.message || "An error occurred"
      );
      errorResponse.headers.set("X-Error-Code", status);

      return errorResponse;
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

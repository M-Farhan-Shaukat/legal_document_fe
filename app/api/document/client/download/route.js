import API from "@/app/utils";
import { decryptData } from "@/app/utils/crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import queryString from "query-string";

export async function GET(req) {
  const parsedParams = queryString.parseUrl(req.url).query;
  const id = parsedParams?.id;

  const cookieStore = await cookies();
  const access_token = decryptData(cookieStore.get("authToken")?.value);

  const url = `/document/${id}/pdf?download=true`;

  try {
    const response = await API.get(url, {
      responseType: "arraybuffer", // important for binary files
      headers: {
        "Content-Type": "application/pdf",
        Accept: "application/pdf",
        Authorization: access_token ? `${access_token}` : "",
      },
    });

    return new NextResponse(Buffer.from(response.data), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document_${id}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Download error:", err?.response?.status, err?.message);

    return NextResponse.json(
      {
        message: "Failed to download PDF",
        success: false,
        error: err?.response?.status || err?.message,
      },
      { status: 500 }
    );
  }
}

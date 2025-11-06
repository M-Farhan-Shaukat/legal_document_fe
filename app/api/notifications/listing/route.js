import queryString from "query-string";
import { cookies } from "next/headers";
import { apiHandler } from "@/app/shared/Apihandler";
import { decryptData } from "@/app/utils/crypto";

export async function GET(req) {
  const cookieStore = await cookies();
  const parsedParams = queryString.parseUrl(req.url).query;
  const userType = decryptData(cookieStore.get("userType")?.value);
  const page = parsedParams?.page;
  const view = parsedParams?.view;

  const url =
    userType === "super_admin"
      ? `/admin/get_notifications/?page=${page}&view=${view}`
      : `/get_notifications/?page=${page}&view=${view}&filter=all&orderBy=desc`;

  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: true,
  });
}

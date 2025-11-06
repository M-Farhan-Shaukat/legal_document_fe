import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function GET(req) {
  const { Id } = queryString.parseUrl(req.url).query;

  const url = `/admin/document/${Id}/questions`;
  return apiHandler({
    url: url,
    payload: payload,
    method: "GET",
    requireAuth: true,
  });
}

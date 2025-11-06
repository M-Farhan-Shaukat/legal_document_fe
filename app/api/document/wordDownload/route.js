import queryString from "query-string";
import { apiHandler } from "@/app/shared/Apihandler";

export async function GET(req) {
  const { id } = queryString.parseUrl(req.url).query;

  const url = `/admin/document/${id}/word`;
  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: true,
  });
}

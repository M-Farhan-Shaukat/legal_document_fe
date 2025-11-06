import queryString from "query-string";
import { apiHandler } from "@/app/shared/Apihandler";

export async function GET(req) {
  const { user_id } = queryString.parseUrl(req.url).query;
  const url = `/admin/template/${user_id}/edit`;
  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: true,
  });
}

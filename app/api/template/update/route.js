import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function PUT(req) {
  const payload = await req.json();
  const { user_id } = queryString.parseUrl(req.url).query;

  const url = `/admin/template/${user_id}`;
  return apiHandler({
    url: url,
    payload: payload,
    method: "PUT",
    requireAuth: true,
  });
}

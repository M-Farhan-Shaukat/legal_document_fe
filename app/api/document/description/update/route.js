import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function PUT(req) {
  const payload = await req.json();
  const { id } = queryString.parseUrl(req.url).query;

  const url = `/admin/document/${id}/description`;
  return apiHandler({
    url: url,
    payload: payload,
    method: "PUT",
    requireAuth: true,
  });
}
import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function PUT(req) {
  const payload = await req.json();
  const parsedParams = queryString.parseUrl(req.url).query;

  const id = parsedParams?.tempId;
  const url = `/admin/template/${id}/price`;
  return apiHandler({
    url: url,
    payload: payload,
    method: "PUT",
    requireAuth: true,
  });
}

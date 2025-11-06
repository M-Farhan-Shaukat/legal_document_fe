import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function POST(req) {
  const payload = await req.formData();
  const parsedParams = queryString.parseUrl(req.url).query;
  const { user_id } = parsedParams;

  const url = `admin/user/${user_id}`;
  return apiHandler({
    url: url,
    payload: payload,
    method: "POST",
    requireAuth: true,
  });
}

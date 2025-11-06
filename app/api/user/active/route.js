import queryString from "query-string";
import { apiHandler } from "@/app/shared/Apihandler";

export async function PUT(req) {
  const parsedParams = queryString.parseUrl(req.url).query;
  const { userId, active } = parsedParams;

  const url =
    active == "true"
      ? `admin/users/${userId}/active`
      : `admin/users/${userId}/inactive`;

  return apiHandler({
    url: url,
    method: "PUT",
    requireAuth: true,
  });
}

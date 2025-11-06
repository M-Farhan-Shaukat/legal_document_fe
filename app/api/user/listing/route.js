import queryString from "query-string";
import { apiHandler } from "@/app/shared/Apihandler";

export async function GET(req) {
  const parsedParams = queryString.parseUrl(req.url).query;
  const { page, view, search, orderBy, sortBy,filter } = parsedParams;
  const url = `admin/users?page=${page}&view=${view}&search=${search}&sortBy=${sortBy}&orderBy=${orderBy}&filter=${filter || "all"}`;

  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: true,
  });
}

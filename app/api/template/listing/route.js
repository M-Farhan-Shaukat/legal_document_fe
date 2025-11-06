import queryString from "query-string";
import { apiHandler } from "@/app/shared/Apihandler";

export async function GET(req) {
  const { page, view, search, sortBy, orderBy, filter } = queryString.parseUrl(
    req.url
  ).query;
  const url = `admin/templates?page=${page}&view=${view}&search=${search}&sortBy=${sortBy}&orderBy=${orderBy}&filter=${
    filter || "all"
  }`;
  return apiHandler({
    url: url,
    requireAuth: true,
  });
}

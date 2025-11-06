import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function GET(req) {
  const { page, view, search, orderBy, sortBy, filter } = queryString.parseUrl(
    req.url
  ).query;
  const url = `/admin/documents?page=${page}&view=${view}&search=${search}&sortBy=${sortBy}&orderBy=${orderBy}&filter=${
    filter ? filter : ""
  }`;
  return apiHandler({
    url: url,
    // payload: payload,
    method: "GET",
    requireAuth: true,
  });
}

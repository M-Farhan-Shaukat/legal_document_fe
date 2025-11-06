import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function GET(req) {
    const { page, view, search, orderBy, sortBy,status } = queryString.parseUrl(
      req.url
    ).query;

    const url = `/admin/documents?page=${page}&view=${view}&search=${search}&sortBy=${sortBy}&orderBy=${orderBy}&filter=${status}`;

    return apiHandler({
      url: url,
      method: "GET",
      requireAuth: true,
    });
}

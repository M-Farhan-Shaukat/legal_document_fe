import queryString from "query-string";
import { apiHandler } from "@/app/shared/Apihandler";

export async function GET(req) {
  const parsedParams = queryString.parseUrl(req.url).query;
  const { page, view, search, orderBy, sortBy,date_range ,startDate,endDate } = parsedParams;
  const url = `admin/payment/histories?page=${page}&view=${view}&search=${search}&sortBy=${sortBy}&orderBy=${orderBy}&date_range=${date_range}&start=${startDate || ""}&end=${endDate || ""}`;

  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: true,
  });
}

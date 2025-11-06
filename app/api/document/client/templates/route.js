import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function GET(req) {
  const { user_id: id, page } = queryString.parseUrl(req.url).query;
  // const url = `/getTemplates?sortBy=id&orderBy=desc`;

  const url = !!id
    ? `/templates?sortBy=id&orderBy=desc&page=${page}&limit=10`
    : `/getTemplates?sortBy=id&orderBy=desc&page=${page}&limit=10`;

  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: !!id ? true : false,
  });
}

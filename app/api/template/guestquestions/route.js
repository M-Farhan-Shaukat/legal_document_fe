import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function GET(req) {
  const parsedParams = queryString.parseUrl(req.url).query;
  const id = parsedParams?.id;
  const url = `/getQuestions/${id}`;
  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: false,
  });
}

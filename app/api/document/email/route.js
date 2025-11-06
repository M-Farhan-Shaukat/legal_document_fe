import queryString from "query-string";
import { apiHandler } from "@/app/shared/Apihandler";

export async function POST(req) {
  const payload = await req.json();
  const { document_id } = queryString.parseUrl(req.url).query;
  const url = `/admin/document/${document_id}/mail`;
  return apiHandler({
    url: url,
    payload: payload,
    method: "POST",
    requireAuth: true,
  });
}

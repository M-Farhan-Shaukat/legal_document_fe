import { apiHandler } from "@/app/shared/Apihandler";
import queryString from "query-string";

export async function DELETE(req) {
  const { tempId } = queryString.parseUrl(req.url).query;
  const url = `/admin/template/${tempId}`;
  return apiHandler({
    url: url,
    method: "DELETE",
    requireAuth: true,
  });
}

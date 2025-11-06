import { apiHandler } from "@/app/shared/Apihandler";

export async function GET() {
  const url = `/admin/document/create`;
  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: true,
  });
}

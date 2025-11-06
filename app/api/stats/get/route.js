import { apiHandler } from "@/app/shared/Apihandler";
export async function GET() {
  const url = `/admin/stats`;
  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: true,
  });
}

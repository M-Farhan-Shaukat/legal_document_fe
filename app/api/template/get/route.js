import { apiHandler } from "@/app/shared/Apihandler";

export async function GET() {
  const url = `/getTemplates?sortBy=id&orderBy=desc`;
  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: true,
  });
}

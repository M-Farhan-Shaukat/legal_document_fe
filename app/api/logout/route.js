import { apiHandler } from "@/app/shared/Apihandler";

export async function POST(req) {
  const url = "/logout";

  return apiHandler({
    url,
    method: "POST",
    payload: {},
    requireAuth: true,
  });
}

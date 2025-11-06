import { apiHandler } from "@/app/shared/Apihandler";

export async function POST(req) {
  const payload = await req.json();
  const url = "/document";
  return apiHandler({
    url: url,
    payload: payload,
    method: "POST",
    requireAuth: true,
  });
}

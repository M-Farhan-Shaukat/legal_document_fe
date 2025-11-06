import { apiHandler } from "@/app/shared/Apihandler";

export async function POST(req) {
  const payload = await req.json();
  const url = "/register/confirm";
  return apiHandler({
    url: url,
    method: "POST",
    payload,
    requireAuth: false,
  });
}

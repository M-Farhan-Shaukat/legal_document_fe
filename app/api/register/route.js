import { apiHandler } from "@/app/shared/Apihandler";

export async function POST(req) {
  const payload = await req.json();
  return apiHandler({
    url: "/register",
    method: "POST",
    payload,
    requireAuth: false,
  });
}

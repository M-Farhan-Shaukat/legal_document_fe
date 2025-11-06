import { apiHandler } from "@/app/shared/Apihandler";

export async function POST(req) {
  const payload = await req.json();
  const url = "/payment/stripeResponse";
  return apiHandler({
    url: url,
    payload: payload,
    method: "GET",
    requireAuth: true,
  });
}

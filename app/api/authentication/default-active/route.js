import { cookies } from "next/headers";
import { decryptData } from "@/app/utils/crypto";
import { apiHandler } from "@/app/shared/Apihandler";

export async function PUT(req) {
  const payload = await req?.json();
  const cookieStore = await cookies();
  const userType = decryptData(cookieStore.get("userType")?.value);
  const url = userType !== "super_admin" ? "/set_defaut" : "/admin/set_defaut";

  return apiHandler({
    url: url,
    method: "PUT",
    payload,
    requireAuth: true,
  });
}

import { apiHandler } from "@/app/shared/Apihandler";
import { decryptData } from "@/app/utils/crypto";
import { cookies } from "next/headers";

export async function PUT(req) {
  const payload = await req.json();
  const cookieStore = await cookies();
  const userType = decryptData(cookieStore.get("userType")?.value);

  const url =
    userType !== "super_admin"
      ? `/change_user_password`
      : `/admin/change_admin_password`;

  return apiHandler({
    url: url,
    method: "PUT",
    payload,
    requireAuth: true,
  });
}

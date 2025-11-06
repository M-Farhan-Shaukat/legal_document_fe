import { apiHandler } from "@/app/shared/Apihandler";
import { decryptData } from "@/app/utils/crypto";
import { cookies } from "next/headers";
import queryString from "query-string";

const getDocumentUrl = (module, userType, id) => {
  const basePaths = {
    businessDocument: {
      regular: `/business_documents/${id}/document`,
      super_admin: `/admin/business_documents/${id}/document`,
    },
    additionalDocument: {
      regular: `/additional_document/${id}/document`,
      super_admin: `/admin/additional_document/${id}/document`,
    },
    invoice: {
      regular: `/invoices/${id}/document`,
      super_admin: `/admin/invoices/${id}/document`,
    },
  };

  if (!basePaths[module]) {
    throw new Error(`Unsupported module: ${module}`);
  }

  return userType === "super_admin"
    ? basePaths[module].super_admin
    : basePaths[module].regular;
};

export async function GET(req) {
  const parsedParams = queryString.parseUrl(req.url).query;
  const id = parsedParams?.id;
  const module = parsedParams?.module;
  const cookieStore = await cookies();
  const userType = decryptData(cookieStore.get("userType")?.value);
  const url = getDocumentUrl(module, userType, id);

  return apiHandler({
    url: url,
    method: "GET",
    requireAuth: true,
  });
}

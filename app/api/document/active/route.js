// import queryString from "query-string";
// import { apiHandler } from "@/app/shared/Apihandler";

// export async function PUT(req) {
//   const payload = await req?.json();
//   const { documentId, status } = queryString.parseUrl(req.url).query;

//   const url =`/admin/document/${documentId}/${status}`

//   return apiHandler({
//     url: url,
//     method: "PUT",
//     payload: payload,
//     requireAuth: true,
//   });
// }



import queryString from "query-string";
import { apiHandler } from "@/app/shared/Apihandler";

export async function PUT(req) {
  let payload = {};

  try {
    // Only parse if body exists
    const text = await req.text();
    if (text) {
      payload = JSON.parse(text);
    }
  } catch (error) {
    console.warn("No JSON body or invalid JSON:", error.message);
  }

  const { documentId, status } = queryString.parseUrl(req.url).query;

  const url = `/admin/document/${documentId}/${status}`;

  return apiHandler({
    url: url,
    method: "PUT",
    payload,
    requireAuth: true,
  });
}

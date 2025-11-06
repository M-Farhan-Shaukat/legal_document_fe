import { NextResponse } from "next/server";
import { decryptData } from "./app/utils/crypto";
import { cookies } from "next/headers";

export function middleware(request) {
  const token = request.cookies.get("authToken")?.value;
  const pathname = request.nextUrl.pathname;
  const userId = Number(request.cookies.get("role_id")?.value || 0);

  // Check if cookies are expired and clear them
  const response = NextResponse.next();

  const publicRoutes = [
    "/login",
    "/reset",
    "/forgot",
    "/register",
    "/admin/signin",
    "/twofactorauthentication",
    "/coming-soon",
  ];
  const adminPrivateRoutes = [
    "/admin/document",
    "/admin/home",
    "/admin/users",
    "/admin/template/create",
  ];
  const userPrivateRoutes = ["/dashboard"];
  const sharedRoutes = [
    "/document/view",
    "/pricing",
    "/success",
    "/cancel",
    "/contact",
    "/blog",
    "/faq",
  ];

  // --- Root redirect ---
  if (pathname === "/" && token && userId === 1) {
    return NextResponse.redirect(new URL("/admin/home", request.url));
  }

  // --- Block access if not logged in and not in sharedRoutes ---
  if (
    !token &&
    !sharedRoutes.some((route) => pathname.startsWith(route)) &&
    (adminPrivateRoutes.some((route) => pathname.startsWith(route)) ||
      userPrivateRoutes.some((route) => pathname.startsWith(route)))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // --- Prevent Admin accessing User routes ---
  if (
    token &&
    userId === 1 &&
    userPrivateRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/admin/home", request.url));
  }

  // --- Prevent User accessing Admin routes ---
  if (
    token &&
    userId !== 1 &&
    adminPrivateRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // --- Prevent logged-in users accessing public routes ---
  if (token && publicRoutes.some((route) => pathname.startsWith(route))) {
    return userId === 1
      ? NextResponse.redirect(new URL("/admin/home", request.url))
      : NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

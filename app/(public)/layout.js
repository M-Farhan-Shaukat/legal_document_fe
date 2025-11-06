"use client";

import { PublicHeader } from "../shared";
import { usePathname } from "next/navigation";

export default function Privatelayout({ children }) {
  const pathname = usePathname();

  const hideHeaderRoutes = [
    "/admin/signin",
    "/admin/forget",
    "/admin/reset-password",
  ];

  const shouldHideHeader = hideHeaderRoutes.includes(pathname);

  return (
    <div className="signin-container">
      {!shouldHideHeader && <PublicHeader />}
      {children}
    </div>
  );
}

"use client";
import { Sidebar } from "@/app/shared";
// import { Sidebar } from "../shared";
import { usePathname } from "next/navigation";
export default function PrivatelayoutAdmin({ children }) {
  const pathname = usePathname();
  return (
    <>
      <div
        className={`layout__container ${
          pathname === "/admin/template/create" ? "bg-offwhite" : ""
        }`}
      >
        <div className="layout__wrapper d-flex">
          <div className="layout__sidebar-wrapper">
            <Sidebar className="layout__sidebar" />
          </div>

          <div className="layout__right-section">
            {/* <PrivateHeader className="layout__header" /> */}
            <div className="layout__content">{children}</div>
          </div>
        </div>
      </div>
      {/* <div className="layout__container--fluid">
        <Footer className="layout__footer" />
      </div> */}
    </>
  );
}

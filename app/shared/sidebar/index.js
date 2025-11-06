"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Avatar,
  Logout,
  HomeIcon,
  Doc,
  DollarNote,
} from "@/public/images";
import "./sidebar.scss";
import Link from "next/link";
import Image from "next/image";
import ButtonX from "../ButtonX";
import { useRouter, usePathname } from "next/navigation";
import { logoutUser } from "@/app/redux/slice/authSlice";
import { FaBars } from "react-icons/fa";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { LocalServer } from "@/app/utils";
import { AiFillEdit } from "react-icons/ai";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";
import { Spinner } from "reactstrap";
import { clearAuthCookies } from "@/app/utils/cookieManager";

export default function Sidebar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false); // 🔹 loader state

  const handleLogout = async () => {
    setLoading(true); // start loader
    try {
      if (true) {
        // Use centralized cookie clearing
        clearAuthCookies();
        dispatch(logoutUser());
        
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }
        router.push("/admin/signin");
        // await LocalServer.post(`/api/logout/admin`, {});
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false); // stop loader
    }
  };

  const NavLink = ({ href, children }) => {
    const pathname = usePathname();
    let currentHref = href.split("/");
    const isActive = pathname.includes(currentHref[2]);

    return (
      <Link
        href={href}
        className={`d-flex align-items-center position-relative text-decoration-none ${
          isActive ? "active-page" : ""
        }`}
      >
        {children}
      </Link>
    );
  };

  function sidebarHandler() {
    setIsSidebarOpen((prev) => !prev);
  }

  return (
    <>
      {typeof window !== "undefined" && window.innerWidth <= 1366 && (
        <div className="hamburger-btn" role="button" onClick={sidebarHandler}>
          <FaBars />
        </div>
      )}

      <div
        className={`marklab-sidebar d-flex flex-column ${
          typeof window !== "undefined" &&
          window.innerWidth <= 1366 &&
          isSidebarOpen
            ? "show"
            : ""
        }`}
      >
        <div className="d-flex align-items-center sidebarInfo">
          <div className="avatarImage rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
            <label htmlFor="fileUpload" className="cursor-pointer">
              <Image
                src={
                  user?.user?.image
                    ? `${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_URL}${user?.user?.image}`
                    : Avatar
                }
                width={50}
                height={50}
                alt="user pic"
                priority
                className="img-fluid"
              />
            </label>
          </div>

          {user?.user?.role_id !== "super_admin" && (
            <div className="userInfo">
              <strong className="text-break">
                Hi, <span>{user?.user?.name}</span>
              </strong>
              <Link
                href={{
                  pathname: `/admin/user-data/${user?.user?.id}`,
                  query: { tab: "profile" },
                }}
              >
                <AiFillEdit />
              </Link>
            </div>
          )}
        </div>

        <ul className="list-unstyled marklabList m-0">
          <li>
            <NavLink href="/admin/home">
              <Image className="me-3" src={HomeIcon} alt="home icon" />
              <span>Home</span>
            </NavLink>
          </li>
          {user?.user?.role_id === 1 && (
            <>
              <li>
                <NavLink href="/admin/document/listing">
                  <Image className="me-3" src={Doc} alt="template icon" />
                  <span>Document</span>
                </NavLink>
              </li>
              <li>
                <NavLink href="/admin/template/listing">
                  <Image className="me-3" src={Doc} alt="template icon" />
                  <span>Template</span>
                </NavLink>
              </li>
              <li>
                <NavLink href="/admin/users">
                  <Image className="me-3" src={User} alt="user icon" />
                  <span>User</span>
                </NavLink>
              </li>
              <li>
                <NavLink href="/admin/payment-history">
                  <Image className="me-3" src={DollarNote} alt="user icon" />
                  <span>Payment History</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="d-flex flex-column mt-auto">
          <ButtonX
            className="btn-logout d-flex align-items-center"
            size="medium"
            logo={Logout}
            clickHandler={handleLogout}
            disabled={loading} // 🔹 disable while loading
          >
            {loading ? <Spinner size="sm" color="light" /> : "Logout"}
            {/* {loading ? "Logging out..." : "Logout"} */}
          </ButtonX>
        </div>
      </div>
    </>
  );
}

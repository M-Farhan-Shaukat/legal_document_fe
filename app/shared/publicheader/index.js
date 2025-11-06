"use client";
import Link from "next/link";
import "./header.scss";
import { FaArrowRight } from "react-icons/fa";
import { GrLanguage } from "react-icons/gr";
import { useState, useEffect } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { LiaTimesSolid } from "react-icons/lia";
import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/app/redux/slice/authSlice";
import { useDispatch } from "react-redux";
import { LocalServer } from "@/app/utils";
import { Spinner } from "reactstrap";
import { useSelector } from "react-redux";
import { clearAuthCookies } from "@/app/utils/cookieManager";

export default function PublicHeader({ isClient = false }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [userName, setUserName] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (user && user?.user && user.user.role_id === 1) {
      clearAuthCookies();
      dispatch(logoutUser());
    }
    if (user && user?.user?.name) {
      setUserName(user.user.name);
    }
  }, [user]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    // whenever pathname changes, stop loader
    setLogoutLoading(false);
  }, [pathname]);

  const handleLogout = async () => {
    // if no user, just go to login page
    if (!user || !user?.user?.name) {
      router.push("/login");
      return;
    }

    setLogoutLoading(true); // start loader
    try {
      // Use centralized cookie clearing
      clearAuthCookies();
      dispatch(logoutUser());

      if (typeof window !== "undefined") {
        // localStorage.clear();
        sessionStorage.clear();
      }
      router.push("/");
      // setLogoutLoading(false); // stop loader

      // await LocalServer.post(`/api/logout`, {});
      // }
    } catch (err) {
      console.error("Logout failed", err);
    }
    // finally {
    //   setLogoutLoading(false); // stop loader
    // }
  };

  const navItems = [
    { path: "/", label: "Online Wills" },
    { path: "/pricing", label: "Pricing" },
    { path: "/about", label: "About Us" },
    { path: "/learn", label: "FAQ" },
  ];
  return (
    <header
      className={`header ${
        [
          "/login",
          "/register",
          "/get-started",
          "/reset-password",
          "/dashboard",
          "/stripeStatus",

          // "/admin/signin",
        ].some(
          (path) =>
            pathname === path ||
            pathname.includes("/questionnaire") ||
            pathname.includes("/document")
          //  ||
          // pathname.includes("/admin")
        )
          ? "started-header"
          : ""
      }`}>
      <div className="header-container">
        <div className="header-inner">
          <div className="header-left">
            <div className="header-logo">
              <Link href="/">Law Forma</Link>
            </div>
          </div>

          <nav className="header--middle desktop-nav">
            <ul className="list-unstyled d-flex flex-wrap justify-content-center m-0 p-0 header-navigation">
              {navItems.map((item) => (
                <li
                  key={item.path}
                  className={`nav-item ${
                    pathname === item.path ? "active" : ""
                  }`}>
                  <Link href={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {userName ? (
            <div className="header-right-actions desktop-actions">
              <h6 style={{ marginRight: "12px" }}>{userName}</h6>
              <a href="/dashboard" className="btn-start">
                Dashboard
              </a>
              {/* <button
                className="language-icon"
                // onClick={() => router.push("/admin/signin")}
              >
                <GrLanguage size={16} /> FR
              </button> */}
            </div>
          ) : (
            <div className="header-right-actions desktop-actions">
              <Link className="login" href="/login">
                Log In
              </Link>
              <a href="/document/view" className="btn-start">
                Start My Will <FaArrowRight size={12} />
              </a>
              {/* <button
                className="language-icon"
                // onClick={() => router.push("/admin/signin")}
              >
                <GrLanguage size={16} /> FR
              </button> */}
            </div>
          )}

          {isClient && (
            <button
              className="login logout"
              onClick={handleLogout}
              disabled={logoutLoading} // prevent multiple clicks
              style={{ minWidth: "70px" }} // keep size when loading
            >
              {logoutLoading ? (
                <Spinner size="sm" color="light" />
              ) : (
                <>{user && user?.user?.name ? "Logout" : "Log In"}</>
              )}
            </button>
          )}

          {/* {isClient && (
            <button
              className="login logout"
              onClick={handleLogout}
              disabled={logoutLoading} // prevent multiple clicks
              style={{ minWidth: "70px" }} // keep size when loading
            >
              {logoutLoading ? <Spinner size="sm" color="light" /> : "Logout"}
            </button>
          )} */}

          <div className="mobile-menu__items-main">
            <div className="mobile-menu--items">
              {/* <button className="language-icon">
                <GrLanguage /> FR
              </button> */}
              <a href="/document/view" className="btn-start-phone">
                Start My Will
              </a>
            </div>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(true)}>
              <RxHamburgerMenu />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}></div>
      )}

      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <button onClick={closeMenu} className="close-btn">
            <LiaTimesSolid size={20} />
          </button>
        </div>
        <nav className="mobile-nav">
          <ul className="mobile-nav-list">
            {navItems.map((item) => (
              <li
                key={item.path}
                className={pathname === item.path ? "active" : ""}>
                <Link href={item.path} onClick={closeMenu}>
                  {item.label}
                </Link>
              </li>
            ))}
            <div className="mobile-login">
              <a href="/login" className="login">
                Log In
              </a>
            </div>
          </ul>
        </nav>
      </div>
    </header>
  );
}

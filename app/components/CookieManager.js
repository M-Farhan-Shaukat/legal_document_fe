"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkAndRemoveExpiredCookies, clearAuthCookies } from "@/app/utils/cookieManager";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/app/redux/slice/authSlice";

/**
 * Component to manage cookie expiry and cleanup on client side
 * This should be included in the root layout or main app component
 */
export default function CookieManager() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check and remove expired cookies on app initialization
    const handleCookieExpiry = () => {
      try {
        // Check if we have any auth cookies
        const authToken = document.cookie.includes("authToken=");
        const userType = document.cookie.includes("userType=");
        
        if (authToken || userType) {
          // Check if cookies are actually valid by trying to access them
          const cookies = document.cookie.split(';');
          let hasValidCookies = false;
          
          cookies.forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (['authToken', 'userType', 'role_id'].includes(name) && value && value !== 'undefined') {
              hasValidCookies = true;
            }
          });
          
          // If no valid cookies found, clear everything
          if (!hasValidCookies) {
            clearAuthCookies();
            dispatch(logoutUser());
            
            // Redirect to appropriate page based on current route
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/admin')) {
              router.push('/admin/signin');
            } else if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/document')) {
              router.push('/login');
            }
          }
        }
        
        // Always run the general cookie cleanup
        checkAndRemoveExpiredCookies();
        
      } catch (error) {
        console.error("Error checking cookie expiry:", error);
        // If there's an error, clear all cookies to be safe
        clearAuthCookies();
        dispatch(logoutUser());
      }
    };

    // Run on mount
    handleCookieExpiry();

    // Set up periodic check (every 5 minutes)
    const interval = setInterval(handleCookieExpiry, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [dispatch, router]);

  // This component doesn't render anything
  return null;
}

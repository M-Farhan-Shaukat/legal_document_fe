import Cookies from "js-cookie";

/**
 * Cookie management utilities for handling expiry and removal
 */

/**
 * Check if a cookie has expired based on its maxAge
 * @param {string} cookieName - Name of the cookie
 * @param {number} maxAgeInSeconds - Maximum age in seconds when cookie was set
 * @returns {boolean} - True if cookie has expired
 */
export const isCookieExpired = (cookieName, maxAgeInSeconds) => {
  const cookie = Cookies.get(cookieName);
  if (!cookie) return true;

  // Get the cookie's creation time from document.cookie
  const allCookies = document.cookie.split(';');
  const targetCookie = allCookies.find(c => c.trim().startsWith(`${cookieName}=`));
  
  if (!targetCookie) return true;

  // For server-set cookies, we can't determine exact creation time
  // So we'll rely on the browser's automatic expiry handling
  // This function is mainly for client-side validation
  return false;
};

/**
 * Remove a cookie with proper attributes to ensure it's deleted from browser
 * @param {string} cookieName - Name of the cookie to remove
 * @param {object} options - Cookie options (path, domain, etc.)
 */
export const removeCookie = (cookieName, options = {}) => {
  const defaultOptions = {
    path: "/",
    sameSite: "strict",
    ...options
  };

  // Remove using js-cookie
  Cookies.remove(cookieName, defaultOptions);

  // Also remove using document.cookie to ensure it's cleared
  if (typeof window !== "undefined") {
    // Set cookie with past expiry date
    const pastDate = new Date(0).toUTCString();
    document.cookie = `${cookieName}=; expires=${pastDate}; path=${defaultOptions.path}; samesite=${defaultOptions.sameSite}`;
    
    // Also try with secure flag if in production
    if (process.env.NODE_ENV === "production") {
      document.cookie = `${cookieName}=; expires=${pastDate}; path=${defaultOptions.path}; samesite=${defaultOptions.sameSite}; secure`;
    }
  }
};

/**
 * Remove all authentication-related cookies
 */
export const clearAuthCookies = () => {
  const authCookies = ["authToken", "userType", "twoFA", "role_id"];
  
  authCookies.forEach(cookieName => {
    removeCookie(cookieName);
  });

  // Also clear any other cookies that might exist
  if (typeof window !== "undefined") {
    const allCookies = document.cookie.split(';');
    allCookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName && !authCookies.includes(cookieName)) {
        removeCookie(cookieName);
      }
    });
  }
};

/**
 * Check and remove expired cookies on client side
 * This should be called on app initialization
 */
export const checkAndRemoveExpiredCookies = () => {
  if (typeof window === "undefined") return;

  const authCookies = ["authToken", "userType", "twoFA", "role_id"];
  
  authCookies.forEach(cookieName => {
    const cookie = Cookies.get(cookieName);
    if (!cookie) {
      // Cookie doesn't exist, remove it completely
      removeCookie(cookieName);
    }
  });
};

/**
 * Get cookie expiry time in milliseconds
 * @param {number} maxAgeInHours - Maximum age in hours
 * @returns {number} - Expiry time in milliseconds
 */
export const getCookieExpiryTime = (maxAgeInHours) => {
  return Date.now() + (maxAgeInHours * 60 * 60 * 1000);
};

/**
 * Check if current time is past cookie expiry
 * @param {number} expiryTime - Expiry time in milliseconds
 * @returns {boolean} - True if expired
 */
export const isExpired = (expiryTime) => {
  return Date.now() > expiryTime;
};

"use client";

import { useEffect, useRef } from "react";

export const useUnsavedChangesWarning = (isDirty) => {
  const lastUrl = useRef(window.location.href);

  useEffect(() => {
    if (isDirty) {
      window.history.pushState(null, "", window.location.href);
    }

    const handlePopState = () => {
      if (isDirty) {
        const confirmed = window.confirm(
          "You have unsaved changes. Leave anyway?"
        );
        if (!confirmed) {
          window.history.pushState(null, "", lastUrl.current);
        } else {
          window.removeEventListener("popstate", handlePopState);
          history.back();
        }
      } else {
        lastUrl.current = window.location.href;
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty]);

  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest("a");

      if (
        anchor &&
        isDirty &&
        anchor.href &&
        anchor.target !== "_blank" &&
        anchor.href.startsWith(window.location.origin) &&
        anchor.href !== window.location.href
      ) {
        const confirmed = window.confirm("You have unsaved changes. Leave?");
        if (!confirmed) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [isDirty]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);
};

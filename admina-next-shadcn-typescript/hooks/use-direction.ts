"use client";

import { useSyncExternalStore } from "react";

type Direction = "ltr" | "rtl";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dir"],
  });
  return () => observer.disconnect();
}

/** The current page direction (`<html dir>`), updated whenever it changes. */
export function useDirection(): Direction {
  return useSyncExternalStore<Direction>(
    subscribe,
    () => (document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr"),
    () => "ltr"
  );
}

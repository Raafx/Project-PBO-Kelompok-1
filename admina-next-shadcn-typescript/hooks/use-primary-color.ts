"use client";

import { useEffect, useState } from "react";

/**
 * The design's default primary (matches globals.css `--primary` ≈ #487fff).
 * Used as a fallback whenever the live `--primary` value can't be parsed to hex
 * (e.g. it is still the default `oklch(...)` and no scheme has been picked).
 */
const DEFAULT_PRIMARY = "#487fff";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const hexToRgb = (hex: string): Rgb | null => {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
};

/**
 * Normalise whatever the Color Scheme customizer wrote into `--primary`
 * (it sets `rgb(r, g, b)`) into a `#rrggbb` string ApexCharts can shade.
 * Falls back to the design default for `oklch(...)` / unknown values.
 */
const normalizeToHex = (color: string): string => {
  const c = (color || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(c)) return c;

  const rgb = c.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1].split(",").map((s) => parseFloat(s.trim()));
    const [r, g, b] = parts;
    if ([r, g, b].every((n) => !Number.isNaN(n))) {
      return (
        "#" +
        [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")
      );
    }
  }
  return DEFAULT_PRIMARY;
};

const readPrimary = (): string => {
  if (typeof window === "undefined") return DEFAULT_PRIMARY;
  const value = getComputedStyle(document.documentElement).getPropertyValue("--primary");
  return normalizeToHex(value);
};

/**
 * Reactive access to the app's primary color (the one changed from the sidebar
 * "Color Scheme" customizer). Re-renders consumers whenever the scheme changes.
 *
 * - `primary`      — `#rrggbb`, drop-in for ApexCharts `colors`.
 * - `primaryLight` — a translucent tint of the primary, for tracks/soft bars.
 */
export function usePrimaryColor() {
  const [primary, setPrimary] = useState<string>(DEFAULT_PRIMARY);

  useEffect(() => {
    const update = () => setPrimary(readPrimary());
    update();

    // The customizer mutates the inline style attribute of <html>.
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    // Keep in sync when the scheme is changed in another tab.
    window.addEventListener("storage", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", update);
    };
  }, []);

  const rgb = hexToRgb(primary);
  const primaryLight = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)` : "rgba(72, 127, 255, 0.22)";

  return { primary, primaryLight };
}

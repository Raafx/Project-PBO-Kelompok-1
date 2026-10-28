import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

// Iconify memuat ikon secara asinkron. Pada JSDOM, proses itu dapat selesai
// setelah test ditutup dan memunculkan error palsu `window is not defined`.
// Test cukup memakai penanda ringan karena yang diuji adalah perilaku halaman.
vi.mock("@iconify/react", () => ({
  Icon: ({ icon, ...props }: { icon: string } & Record<string, unknown>) =>
    createElement("span", { "data-icon": icon, ...props }),
}));

afterEach(() => cleanup());

Object.defineProperty(Element.prototype, "scrollIntoView", {
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(window, "print", {
  configurable: true,
  value: vi.fn(),
});

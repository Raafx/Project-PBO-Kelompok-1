import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

const routes = ["/dashboard", "/auth/login", "/auth/register"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return routes.map((route) => ({
    url: new URL(route, base).toString(),
    changeFrequency: "monthly",
    priority: route === "/dashboard" ? 1 : 0.5,
  }));
}

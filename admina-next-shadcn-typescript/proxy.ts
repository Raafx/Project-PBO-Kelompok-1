import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "./auth";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/create-password",
];

// Only Auth.js's own endpoints (sign-in, callback, csrf, session…) are public.
// Every other /api route requires a session here AND must still verify it
// independently inside the handler (see lib/auth-guard.ts) — the proxy is a
// first line of defence, not the only one.
const publicApiRoutes = ["/api/auth"];

const matchesRoute = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicApiRoutes.some((route) => matchesRoute(pathname, route))) {
    return NextResponse.next();
  }

  let session = null;

  try {
    session = await auth();
  } catch {
    session = null;
  }

  const isApi = matchesRoute(pathname, "/api");
  const isPublic = publicRoutes.some((route) => matchesRoute(pathname, route));

  if (!session?.user && !isPublic) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next.js internals, the generated social preview images, and static
  // files (anything with a file extension, e.g. images, favicon, robots.txt,
  // sitemap.xml).
  matcher: ["/((?!_next/static|_next/image|opengraph-image|twitter-image|.*\\.[\\w]+$).*)"],
};

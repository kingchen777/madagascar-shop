import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./lib/i18n";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

const ADMIN_COOKIE = "madashop_admin";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin API protection ────────────────────────────────────────────────
  if (pathname.startsWith("/api/admin")) {
    // Login/logout endpoint is always accessible
    if (pathname === "/api/admin/login") return NextResponse.next();

    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const validToken = process.env.ADMIN_SESSION_TOKEN ?? process.env.ADMIN_PASSWORD;

    if (!validToken || token !== validToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  // ── Admin page protection ───────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Login page is always accessible
    if (pathname === "/admin/login") return NextResponse.next();

    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const validToken = process.env.ADMIN_SESSION_TOKEN ?? process.env.ADMIN_PASSWORD;

    if (!validToken || token !== validToken) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── i18n locale routing for all other paths ─────────────────────────────
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Include /api/admin and /admin routes (handled above)
    "/api/admin/:path*",
    "/admin/:path*",
    // Exclude: _next internals, static files (but not api)
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).+)",
    "/",
  ],
};

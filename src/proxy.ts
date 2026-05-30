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

  // ── Admin route protection ──────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Login page is always accessible
    if (pathname === "/admin/login") return NextResponse.next();

    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const validToken = process.env.ADMIN_SESSION_TOKEN;

    // If no token configured, block access (must set env var)
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
    // Include /admin routes (handled above)
    "/admin/:path*",
    // Exclude: api, _next internals, static files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).+)",
    "/",
  ],
};

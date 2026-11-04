import { NextResponse, type NextRequest } from "next/server";
import { isLocale, negotiateLocale } from "@/i18n/config";

/**
 * Sends URLs without a language prefix to the visitor's preferred language:
 * `/` → `/de` for a German browser, `/en` for everyone else. URLs that
 * already carry a locale are left alone, so the language switcher's choice
 * sticks without needing a cookie.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";

  if (isLocale(firstSegment)) return;

  const locale = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url);
  response.headers.set("Vary", "Accept-Language");
  return response;
}

export const config = {
  // Skip Next.js internals and anything that looks like a file (robots.txt,
  // sitemap.xml, icon.svg, images in /public).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};

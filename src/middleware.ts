import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  // Exclude static assets, api routes, and common files
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const domainParts = hostname.split(".");

  let subdomain: string | null = null;
  if (hostname.endsWith("localhost") && domainParts.length > 1) {
    subdomain = domainParts[0].toLowerCase();
  } else if (
    (hostname.endsWith("trodex.com") && domainParts.length > 2) ||
    (hostname.endsWith("trodex.vercel.app") && domainParts.length > 3)
  ) {
    subdomain = domainParts[0].toLowerCase();
  }

  if (subdomain && subdomain !== "www") {
    // Rewrite internally from subdomain root to /username route
    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. static files (e.g. /favicon.ico, /images)
     */
    "/((?!api|_next|static|.*\\..*).*)",
  ],
};

import { NextRequest } from "next/server";

export function getSubdomain(req: NextRequest): string | null {
  // 1. Query param is priority
  const { searchParams } = new URL(req.url);
  const subQuery = searchParams.get("subdomain");
  if (subQuery) {
    return subQuery.toLowerCase();
  }

  // 2. Cookie fallback
  const simulatedCookie = req.cookies.get("simulated_subdomain")?.value;
  if (simulatedCookie) {
    return simulatedCookie.toLowerCase();
  }

  // 3. Header host parsing
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const domainParts = hostname.split(".");

  // e.g. username.localhost
  if (hostname.endsWith("localhost") && domainParts.length > 1) {
    return domainParts[0].toLowerCase();
  }

  // e.g. username.trodex.com
  if (hostname.endsWith("trodex.com") && domainParts.length > 2) {
    return domainParts[0].toLowerCase();
  }

  // General subdomain detection if not a local dev environment or standard cloud run domains
  if (domainParts.length > 2 && !hostname.endsWith("run.app") && !hostname.endsWith("web.app")) {
    return domainParts[0].toLowerCase();
  }

  return null;
}

import { NextRequest, NextResponse } from "next/server";
import { getSubdomain } from "../../lib/subdomain";

export async function GET(req: NextRequest) {
  const subdomain = getSubdomain(req);
  
  if (!subdomain) {
    return new NextResponse(`User-agent: *
Allow: /
`, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  return new NextResponse(`User-agent: *
Allow: /
Sitemap: https://${subdomain}.trodex.com/sitemap.xml
`, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

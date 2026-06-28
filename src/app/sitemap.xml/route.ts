import { NextRequest, NextResponse } from "next/server";
import { getSubdomain } from "../../lib/subdomain";
import { db } from "../../lib/db";

export async function GET(req: NextRequest) {
  const subdomain = getSubdomain(req);
  if (!subdomain) {
    return new NextResponse("Sitemap only available for subdomains", { status: 404 });
  }

  try {
    const user = await db.getUserByUsername(subdomain);
    if (!user) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    const posts = await db.getPosts({ userId: user.id });
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://${subdomain}.trodex.com/</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    for (const post of posts) {
      xml += `
  <url>
    <loc>https://${subdomain}.trodex.com/post/${post.slug}</loc>
    <lastmod>${new Date(post.created_at).toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += `\n</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (err) {
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}

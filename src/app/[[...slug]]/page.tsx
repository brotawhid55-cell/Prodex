import { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { db } from "../../lib/db";
import ClientApp from "../../components/ClientApp";

interface PageProps {
  params: {
    slug?: string[];
  };
  searchParams: {
    subdomain?: string;
  };
}

function extractMetaContent(tagOrValue: string | null | undefined): string {
  if (!tagOrValue) return "";
  const trimmed = tagOrValue.trim();
  if (trimmed.startsWith("<meta")) {
    const match = trimmed.match(/content=["']([^"']+)["']/);
    if (match && match[1]) return match[1];
  }
  return trimmed;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const slugArray = params.slug || [];
  const cookieStore = cookies();
  const headerList = headers();

  // Determine active subdomain (via query parameter, cookie simulation, or host header)
  let subdomain = searchParams?.subdomain || cookieStore.get("simulated_subdomain")?.value || null;

  if (!subdomain) {
    const host = headerList.get("host") || "";
    const hostname = host.split(":")[0];
    const domainParts = hostname.split(".");
    if (hostname.endsWith("localhost") && domainParts.length > 1) {
      subdomain = domainParts[0].toLowerCase();
    } else if (
      (hostname.endsWith("trodex.com") && domainParts.length > 2) ||
      (hostname.endsWith("trodex.vercel.app") && domainParts.length > 3)
    ) {
      subdomain = domainParts[0].toLowerCase();
    } else if (domainParts.length > 2 && !hostname.endsWith("run.app") && !hostname.endsWith("web.app") && !hostname.endsWith("vercel.app")) {
      subdomain = domainParts[0].toLowerCase();
    }
  }

  // Handle subdomain and internal path resolution
  let activeUsername = subdomain;
  let isPost = false;
  let activePostSlug = "";

  if (slugArray.length > 0 && !["login", "register", "create-post", "settings"].includes(slugArray[0])) {
    activeUsername = slugArray[0];
    if (slugArray[1] === "post" && slugArray[2]) {
      isPost = true;
      activePostSlug = slugArray[2];
    } else if (slugArray[1]) {
      isPost = true;
      activePostSlug = slugArray[1];
    }
  } else if (subdomain) {
    if (slugArray[0] === "post" && slugArray[1]) {
      isPost = true;
      activePostSlug = slugArray[1];
    } else if (slugArray[0] && !["login", "register", "create-post", "settings"].includes(slugArray[0])) {
      isPost = true;
      activePostSlug = slugArray[0];
    }
  }

  let title = "Trodex | Curated Products & Reviews";
  let description = "Discover and shop highly curated, real user product recommendations, verified reviews, and top affiliate gear.";
  let imageUrl = "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800";
  let canonicalUrl = `https://trodex.com/${slugArray.join("/")}`;
  let otherMeta: any = {};

  if (activeUsername) {
    try {
      const user = await db.getUserByUsername(activeUsername);
      if (user) {
        // Build all verification tags
        const googleCode = extractMetaContent(user.google_verification);
        if (googleCode) otherMeta["google-site-verification"] = googleCode;

        const bingCode = extractMetaContent(user.bing_verification);
        if (bingCode) otherMeta["msvalidate.01"] = bingCode;

        const yandexCode = extractMetaContent(user.yandex_verification);
        if (yandexCode) otherMeta["yandex-verification"] = yandexCode;

        const baiduCode = extractMetaContent(user.baidu_verification);
        if (baiduCode) otherMeta["baidu-site-verification"] = baiduCode;

        const pinCode = extractMetaContent(user.pinterest_verification);
        if (pinCode) otherMeta["p:domain_verify"] = pinCode;

        // Fallback to legacy
        if (user.search_console_meta_tag && !googleCode) {
          const legacyGoogle = extractMetaContent(user.search_console_meta_tag);
          if (legacyGoogle) otherMeta["google-site-verification"] = legacyGoogle;
        }

        if (isPost && activePostSlug) {
          const post = await db.getPostBySlugAndUser(user.id, activePostSlug);
          if (post) {
            title = `${post.title} - ${post.rating}★ | Trodex`;
            description = post.meta_description;
            imageUrl = post.image_url;
            canonicalUrl = `https://${activeUsername}.trodex.com/post/${post.slug}`;
          }
        } else {
          title = `${user.display_name}'s Products | Trodex`;
          description = user.bio || `Explore handpicked products, custom reviews, and affiliate items curated by ${user.display_name} on Trodex.`;
          imageUrl = user.avatar_url;
          canonicalUrl = `https://${activeUsername}.trodex.com/`;
        }
      }
    } catch (err) {
      console.error("Database connection failed in generateMetadata:", err);
    }
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      images: [imageUrl],
      url: canonicalUrl,
      type: (isPost ? "product" : "website") as any,
    },
    other: Object.keys(otherMeta).length > 0 ? otherMeta : undefined
  };
}

export default async function CatchAllPage({ params, searchParams }: PageProps) {
  const slugArray = params.slug || [];
  const cookieStore = cookies();
  const headerList = headers();

  // Determine active subdomain
  let subdomain = searchParams?.subdomain || cookieStore.get("simulated_subdomain")?.value || null;

  if (!subdomain) {
    const host = headerList.get("host") || "";
    const hostname = host.split(":")[0];
    const domainParts = hostname.split(".");
    if (hostname.endsWith("localhost") && domainParts.length > 1) {
      subdomain = domainParts[0].toLowerCase();
    } else if (
      (hostname.endsWith("trodex.com") && domainParts.length > 2) ||
      (hostname.endsWith("trodex.vercel.app") && domainParts.length > 3)
    ) {
      subdomain = domainParts[0].toLowerCase();
    } else if (domainParts.length > 2 && !hostname.endsWith("run.app") && !hostname.endsWith("web.app") && !hostname.endsWith("vercel.app")) {
      subdomain = domainParts[0].toLowerCase();
    }
  }

  let activeUsername = subdomain;
  let isPost = false;
  let activePostSlug = "";

  if (slugArray.length > 0 && !["login", "register", "create-post", "settings"].includes(slugArray[0])) {
    activeUsername = slugArray[0];
    if (slugArray[1] === "post" && slugArray[2]) {
      isPost = true;
      activePostSlug = slugArray[2];
    } else if (slugArray[1]) {
      isPost = true;
      activePostSlug = slugArray[1];
    }
  } else if (subdomain) {
    if (slugArray[0] === "post" && slugArray[1]) {
      isPost = true;
      activePostSlug = slugArray[1];
    } else if (slugArray[0] && !["login", "register", "create-post", "settings"].includes(slugArray[0])) {
      isPost = true;
      activePostSlug = slugArray[0];
    }
  }

  let postJsonLd = null;

  if (activeUsername && isPost && activePostSlug) {
    try {
      const user = await db.getUserByUsername(activeUsername);
      if (user) {
        const post = await db.getPostBySlugAndUser(user.id, activePostSlug);
        if (post) {
          postJsonLd = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": post.title,
            "description": post.meta_description,
            "image": post.image_url,
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": String(post.rating),
              "reviewCount": String(post.review_count)
            }
          };
        }
      }
    } catch (err) {
      console.error("Failed to generate JSON-LD schema:", err);
    }
  }

  return (
    <>
      {postJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
        />
      )}
      <ClientApp />
    </>
  );
}

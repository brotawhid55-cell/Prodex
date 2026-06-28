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

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const slugArray = params.slug || [];
  const isPostRoute = slugArray[0] === "post";
  const postSlug = isPostRoute ? slugArray[1] : "";

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
    } else if (hostname.endsWith("trodex.com") && domainParts.length > 2) {
      subdomain = domainParts[0].toLowerCase();
    } else if (domainParts.length > 2 && !hostname.endsWith("run.app") && !hostname.endsWith("web.app")) {
      subdomain = domainParts[0].toLowerCase();
    }
  }

  let title = "Trodex | Curated Products & Reviews";
  let description = "Discover and shop highly curated, real user product recommendations, verified reviews, and top affiliate gear.";
  let imageUrl = "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800";
  let canonicalUrl = `https://trodex.com/${slugArray.join("/")}`;
  let verificationCode = "";

  if (subdomain) {
    const user = await db.getUserByUsername(subdomain);
    if (user) {
      if (user.search_console_meta_tag) {
        const match = user.search_console_meta_tag.match(/content="([^"]+)"/);
        if (match) {
          verificationCode = match[1];
        } else {
          verificationCode = user.search_console_meta_tag;
        }
      }

      if (isPostRoute && postSlug) {
        const post = await db.getPostBySlugAndUser(user.id, postSlug);
        if (post) {
          title = `${post.title} - ${post.rating}★ | trodex`;
          description = post.meta_description;
          imageUrl = post.image_url;
          canonicalUrl = `https://${subdomain}.trodex.com/post/${post.slug}`;
        }
      } else {
        title = `${user.display_name}'s Products | trodex`;
        description = user.bio || `Explore handpicked products, custom reviews, and affiliate items curated by ${user.display_name} on Trodex.`;
        imageUrl = user.avatar_url;
        canonicalUrl = `https://${subdomain}.trodex.com/`;
      }
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
      type: isPostRoute ? "article" : "website",
    },
    other: verificationCode ? {
      "google-site-verification": verificationCode
    } : undefined
  };
}

export default function CatchAllPage() {
  return <ClientApp />;
}

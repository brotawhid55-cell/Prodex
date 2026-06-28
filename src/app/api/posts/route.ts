import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getAuthUser } from "../../../lib/auth";

// GET /api/posts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const username = searchParams.get("username") || undefined;

  try {
    let userId: string | undefined;
    if (username) {
      const user = await db.getUserByUsername(username);
      if (!user) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
      }
      userId = user.id;
    }

    const posts = await db.getPosts({ search, userId });
    return NextResponse.json(posts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/posts (Authenticated)
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const { title, meta_description, image_url, about, rating, review_count, shop_url } = await req.json();

    if (!title || !meta_description || !image_url || !about || rating === undefined || review_count === undefined || !shop_url) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (title.length > 100) {
      return NextResponse.json({ error: "Title must be under 100 characters." }, { status: 400 });
    }

    if (meta_description.length > 160) {
      return NextResponse.json({ error: "Meta description must be under 160 characters." }, { status: 400 });
    }

    if (about.length > 1000) {
      return NextResponse.json({ error: "About text must be under 1000 characters." }, { status: 400 });
    }

    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating < 1.0 || numRating > 5.0) {
      return NextResponse.json({ error: "Rating must be a decimal between 1.0 and 5.0" }, { status: 400 });
    }

    const numReviewCount = parseInt(review_count);
    if (isNaN(numReviewCount) || numReviewCount < 0) {
      return NextResponse.json({ error: "Review count must be a non-negative integer" }, { status: 400 });
    }

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    
    if (!slug) {
      slug = `product-${Date.now()}`;
    }

    // Verify uniqueness for user
    const existing = await db.getPostBySlugAndUser(user.userId, slug);
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    const newPost = {
      id: crypto.randomUUID(),
      user_id: user.userId,
      title,
      meta_description,
      image_url,
      about,
      rating: numRating,
      review_count: numReviewCount,
      shop_url,
      slug,
      created_at: new Date().toISOString()
    };

    const saved = await db.createPost(newPost);
    return NextResponse.json({ success: true, slug: saved.slug });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create post: " + err.message }, { status: 500 });
  }
}

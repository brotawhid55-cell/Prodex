import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

interface RouteParams {
  params: {
    id: string;
    slug: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: username, slug } = params;

    if (!username || !slug) {
      return NextResponse.json({ error: "Username and slug are required" }, { status: 400 });
    }

    const user = await db.getUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const post = await db.getPostBySlugAndUser(user.id, slug);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Increment view_count
    await db.incrementViewCount(post.id);

    // Get the updated post with updated view count
    const updatedPost = await db.getPostBySlugAndUser(user.id, slug);

    return NextResponse.json(updatedPost);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch post: " + err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getAuthUser } from "../../../../lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await db.getPostById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check ownership
    if (post.user_id !== user.userId) {
      return NextResponse.json({ error: "You are not authorized to delete this post" }, { status: 403 });
    }

    await db.deletePost(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete post: " + err.message }, { status: 500 });
  }
}

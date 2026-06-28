import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getAuthUser } from "../../../../lib/auth";

export async function GET(req: NextRequest) {
  const decoded = getAuthUser(req);
  if (!decoded) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      const response = NextResponse.json({ error: "User not found" }, { status: 401 });
      response.cookies.delete("token");
      return response;
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      bio: user.bio,
      avatar_url: user.avatar_url,
      search_console_meta_tag: user.search_console_meta_tag
    });
  } catch (err) {
    const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
    response.cookies.delete("token");
    return response;
  }
}

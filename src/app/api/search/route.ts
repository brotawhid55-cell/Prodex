import { NextRequest, NextResponse } from "next/server";
import { getSql, ensureDbInitialized } from "../../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("q") || "";

    await ensureDbInitialized();
    const sql = getSql();

    const posts = await sql`
      SELECT p.*, u.username, u.display_name, u.avatar_url
      FROM posts p JOIN users u ON p.user_id = u.id
      WHERE p.title ILIKE ${'%' + term + '%'}
      OR p.about ILIKE ${'%' + term + '%'}
      LIMIT 20
    `;

    return NextResponse.json(posts);
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to search: " + err.message }, { status: 500 });
  }
}

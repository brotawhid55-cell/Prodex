import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getSql, ensureDbInitialized } from "../../../../lib/db";
import { JWT_SECRET } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier and password are required" }, { status: 400 });
    }

    await ensureDbInitialized();
    const sql = getSql();

    const rows = await sql`
      SELECT * FROM users 
      WHERE email = ${identifier} 
      OR username = ${identifier} 
      LIMIT 1
    `;

    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url
      }
    });

    response.cookies.set("trodex-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: "/"
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error on login: " + err.message }, { status: 500 });
  }
}

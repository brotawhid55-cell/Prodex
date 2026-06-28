import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../../../lib/db";
import { JWT_SECRET } from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const usernameRegex = /^[a-z0-9]+$/;
    const lowerUsername = username.toLowerCase().trim();
    if (!usernameRegex.test(lowerUsername)) {
      return NextResponse.json(
        { error: "Username must be lowercase and alphanumeric only (no spaces or special characters)." },
        { status: 400 }
      );
    }

    const existingEmail = await db.getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const existingUsername = await db.getUserByUsername(lowerUsername);
    if (existingUsername) {
      return NextResponse.json({ error: "This username is already taken." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    const newUser = {
      id,
      username: lowerUsername,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      display_name: username, // default to username
      bio: "",
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${lowerUsername}`,
      search_console_meta_tag: null,
      created_at: new Date().toISOString()
    };

    await db.createUser(newUser);

    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      username: newUser.username
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
    return NextResponse.json({ error: "Internal server error registration: " + err.message }, { status: 500 });
  }
}

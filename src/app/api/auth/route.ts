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

    // Create user and get the DB-generated ID back
    const createdUser = await db.createUser({
      username: lowerUsername,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      display_name: username,
      bio: "",
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${lowerUsername}`,
    });

    // CRITICAL: use createdUser.id (from DB), NOT a pre-generated UUID
    const token = jwt.sign(
      { userId: createdUser.id, username: createdUser.username, email: createdUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      username: createdUser.username
    });

    response.cookies.set("trodex-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: "Registration failed: " + err.message }, { status: 500 });
  }
}

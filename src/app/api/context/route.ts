import { NextRequest, NextResponse } from "next/server";
import { db, isUsingNeon } from "../../../lib/db";
import { getSubdomain } from "../../../lib/subdomain";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const subdomain = getSubdomain(req);
  let subdomainUser = null;
  let currentUser = null;
  let dbError = null;

  try {
    if (subdomain) {
      const rawSubUser = await db.getUserByUsername(subdomain);
      if (rawSubUser) {
        subdomainUser = {
          id: rawSubUser.id,
          username: rawSubUser.username,
          display_name: rawSubUser.display_name,
          bio: rawSubUser.bio,
          avatar_url: rawSubUser.avatar_url,
          search_console_meta_tag: rawSubUser.search_console_meta_tag,
          google_verification: rawSubUser.google_verification,
          bing_verification: rawSubUser.bing_verification,
          yandex_verification: rawSubUser.yandex_verification,
          baidu_verification: rawSubUser.baidu_verification,
          pinterest_verification: rawSubUser.pinterest_verification
        };
      }
    }

    // 1. Read "trodex-token" cookie from request
    const token = req.cookies.get("trodex-token")?.value;
    if (token) {
      try {
        // 2. Verify JWT and extract userId
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && decoded.userId) {
          // 3. Query user from DB using that userId
          const rawUser = await db.getUserById(decoded.userId);
          if (rawUser) {
            currentUser = {
              id: rawUser.id,
              username: rawUser.username,
              email: rawUser.email,
              display_name: rawUser.display_name,
              bio: rawUser.bio,
              avatar_url: rawUser.avatar_url,
              search_console_meta_tag: rawUser.search_console_meta_tag,
              google_verification: rawUser.google_verification,
              bing_verification: rawUser.bing_verification,
              yandex_verification: rawUser.yandex_verification,
              baidu_verification: rawUser.baidu_verification,
              pinterest_verification: rawUser.pinterest_verification
            };
          }
        }
      } catch (jwtErr) {
        // If cookie missing or invalid -> return currentUser: null (not an error)
        currentUser = null;
      }
    }
  } catch (err: any) {
    console.error("Database lookup failed in /api/context:", err);
    dbError = err.message || "An unexpected database error occurred.";
  }

  return NextResponse.json({
    subdomain,
    subdomainUser,
    currentUser,
    isUsingNeon,
    error: dbError
  });
}


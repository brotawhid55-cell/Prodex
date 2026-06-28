import { NextRequest, NextResponse } from "next/server";
import { db, isUsingNeon } from "../../../lib/db";
import { getSubdomain } from "../../../lib/subdomain";
import { getAuthUser } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const subdomain = getSubdomain(req);
  let subdomainUser = null;

  if (subdomain) {
    const rawSubUser = await db.getUserByUsername(subdomain);
    if (rawSubUser) {
      subdomainUser = {
        id: rawSubUser.id,
        username: rawSubUser.username,
        display_name: rawSubUser.display_name,
        bio: rawSubUser.bio,
        avatar_url: rawSubUser.avatar_url,
        search_console_meta_tag: rawSubUser.search_console_meta_tag
      };
    }
  }

  let currentUser = null;
  const decoded = getAuthUser(req);
  if (decoded) {
    const rawUser = await db.getUserById(decoded.userId);
    if (rawUser) {
      currentUser = {
        id: rawUser.id,
        username: rawUser.username,
        email: rawUser.email,
        display_name: rawUser.display_name,
        bio: rawUser.bio,
        avatar_url: rawUser.avatar_url,
      };
    }
  }

  return NextResponse.json({
    subdomain,
    subdomainUser,
    currentUser,
    isUsingNeon
  });
}

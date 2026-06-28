import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { getAuthUser } from "../../../../lib/auth";

export async function PUT(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
  }

  try {
    const { 
      display_name, 
      bio, 
      avatar_url, 
      search_console_meta_tag,
      google_verification,
      bing_verification,
      yandex_verification,
      baidu_verification,
      pinterest_verification
    } = await req.json();

    const updates: any = {};
    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) {
      if (bio.length > 160) {
        return NextResponse.json({ error: "Bio must be under 160 characters." }, { status: 400 });
      }
      updates.bio = bio;
    }
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (search_console_meta_tag !== undefined) {
      updates.search_console_meta_tag = search_console_meta_tag;
    }
    if (google_verification !== undefined) updates.google_verification = google_verification;
    if (bing_verification !== undefined) updates.bing_verification = bing_verification;
    if (yandex_verification !== undefined) updates.yandex_verification = yandex_verification;
    if (baidu_verification !== undefined) updates.baidu_verification = baidu_verification;
    if (pinterest_verification !== undefined) updates.pinterest_verification = pinterest_verification;

    const updatedUser = await db.updateUser(user.userId, updates);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update settings: " + err.message }, { status: 500 });
  }
}

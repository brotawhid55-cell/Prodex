import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { subdomain } = await req.json();
    const response = NextResponse.json({ success: true, subdomain });
    
    if (subdomain) {
      response.cookies.set("simulated_subdomain", subdomain.toLowerCase(), {
        httpOnly: false,
        maxAge: 30 * 24 * 3600, // 30 days in seconds
        path: "/"
      });
    } else {
      response.cookies.delete("simulated_subdomain");
    }
    
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

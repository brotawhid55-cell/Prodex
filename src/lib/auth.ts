import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "trodex-super-secret-key-123";

export interface DecodedToken {
  userId: string;
  username: string;
}

export function getAuthUser(req: NextRequest): DecodedToken | null {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (err) {
    return null;
  }
}

export { JWT_SECRET };

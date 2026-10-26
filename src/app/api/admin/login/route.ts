import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signAdminToken, ADMIN_COOKIE } from "@/lib/adminAuth";
import { jsonError, parseBody, safeEqual } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const schema = z.object({ username: z.string().max(200), password: z.string().max(200) });

export async function POST(req: NextRequest) {
  const limited = rateLimit(`admin-login:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (limited) return limited;

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass || expectedPass.length < 12) {
    console.error("ADMIN_USERNAME and ADMIN_PASSWORD (12+ characters) must be set");
    return jsonError("Admin login is not configured", 503);
  }

  const { data, error } = await parseBody(req, schema);
  if (error) return error;

  // Evaluate both so a wrong username takes as long as a wrong password
  const validUser = safeEqual(data.username, expectedUser);
  const validPass = safeEqual(data.password, expectedPass);
  if (!validUser || !validPass) {
    return jsonError("Invalid credentials", 401);
  }

  const token = await signAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24h
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}

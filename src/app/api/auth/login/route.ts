import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signCustomerToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";
import { jsonError, parseBody } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: z.string().min(1, "Password is required").max(200),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`login:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const { data, error } = await parseBody(req, schema);
    if (error) return error;

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return jsonError("Invalid email or password", 401);
    }

    const token = await signCustomerToken(user.id);
    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email });
    res.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error(err);
    return jsonError("Login failed", 500);
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(CUSTOMER_COOKIE);
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signCustomerToken, CUSTOMER_COOKIE } from "@/lib/customerAuth";
import { isPrismaError, jsonError, parseBody } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rateLimit";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`signup:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (limited) return limited;

  try {
    const { data, error } = await parseBody(req, schema);
    if (error) return error;

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, phone: data.phone, password: hashed, role: "customer" },
    });

    const token = await signCustomerToken(user.id);
    const res = NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
    res.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch (err) {
    if (isPrismaError(err, "P2002")) {
      return jsonError("An account with this email already exists", 409);
    }
    console.error(err);
    return jsonError("Signup failed", 500);
  }
}

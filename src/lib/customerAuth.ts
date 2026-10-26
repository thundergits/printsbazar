import { SignJWT, jwtVerify } from "jose";
import { jwtSecret } from "@/lib/secrets";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "ms_customer_token";

export async function signCustomerToken(userId: string) {
  return new SignJWT({ sub: userId, role: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(jwtSecret());
}

export async function verifyCustomerToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret());
    if (payload.role !== "customer" || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export async function getCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  const userId = await verifyCustomerToken(token);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}

export { COOKIE as CUSTOMER_COOKIE };

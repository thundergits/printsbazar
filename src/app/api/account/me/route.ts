import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customerAuth";

export async function GET() {
  const user = await getCustomerSession();
  if (!user) return NextResponse.json({ user: null, defaultAddress: null });

  const defaultAddress =
    (await prisma.address.findFirst({ where: { userId: user.id, isDefault: true } })) ??
    (await prisma.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }));

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    defaultAddress,
  });
}

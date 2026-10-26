import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customerAuth";
import { parseBody } from "@/lib/api";
import { addressSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCustomerSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const user = await getCustomerSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await parseBody(req, addressSchema);
  if (error) return error;
  const { label, name, phone, line1, line2, city, state, pincode, isDefault } = data;

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: label || "Home",
      name, phone, line1, line2, city, state, pincode,
      isDefault: Boolean(isDefault),
    },
  });
  return NextResponse.json(address, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { isPrismaError, jsonError, parseBody } from "@/lib/api";

const createSchema = z
  .object({
    code: z.string().trim().min(2).max(50).regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, - or _ only"),
    type: z.enum(["percent", "flat"]),
    value: z.coerce.number().positive("Value must be greater than 0"),
    minOrder: z.coerce.number().min(0).optional(),
    maxUses: z.union([z.coerce.number().int().positive(), z.literal(""), z.null()]).optional(),
    expiresAt: z.union([z.coerce.date(), z.literal(""), z.null()]).optional(),
  })
  .refine((c) => c.type !== "percent" || c.value <= 100, { message: "Percentage can't exceed 100", path: ["value"] });

const idSchema = z.object({ id: z.string().min(1) });
const toggleSchema = idSchema.extend({ isActive: z.boolean() });

export async function GET() {
  if (!await getAdminSession()) return jsonError("Unauthorized", 401);
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return jsonError("Unauthorized", 401);
  const { data, error } = await parseBody(req, createSchema);
  if (error) return error;

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        type: data.type,
        value: data.value,
        minOrder: data.minOrder ?? 0,
        maxUses: typeof data.maxUses === "number" ? data.maxUses : null,
        isActive: true,
        expiresAt: data.expiresAt instanceof Date ? data.expiresAt : null,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (err) {
    if (isPrismaError(err, "P2002")) return jsonError("A coupon with this code already exists", 409);
    throw err;
  }
}

export async function PATCH(req: NextRequest) {
  if (!await getAdminSession()) return jsonError("Unauthorized", 401);
  const { data, error } = await parseBody(req, toggleSchema);
  if (error) return error;
  try {
    const coupon = await prisma.coupon.update({ where: { id: data.id }, data: { isActive: data.isActive } });
    return NextResponse.json(coupon);
  } catch (err) {
    if (isPrismaError(err, "P2025")) return jsonError("Coupon not found", 404);
    throw err;
  }
}

export async function DELETE(req: NextRequest) {
  if (!await getAdminSession()) return jsonError("Unauthorized", 401);
  const { data, error } = await parseBody(req, idSchema);
  if (error) return error;
  try {
    await prisma.coupon.delete({ where: { id: data.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isPrismaError(err, "P2025")) return jsonError("Coupon not found", 404);
    throw err;
  }
}

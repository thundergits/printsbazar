import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { isPrismaError, jsonError, parseBody } from "@/lib/api";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  basePrice: z.coerce.number().positive().optional(),
  comparePrice: z.union([z.coerce.number().positive(), z.literal(""), z.null()]).optional(),
  imageUrl: z
    .string()
    .trim()
    .max(2048)
    .refine((u) => u.startsWith("/") || /^https:\/\//.test(u), "Image URL must start with https:// or /")
    .optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isCustomizable: z.boolean().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        priceAdj: z.coerce.number().default(0),
        options: z.array(z.object({ label: z.string().max(100), value: z.string().max(100) })).min(1).max(50),
      })
    )
    .max(20)
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await getAdminSession()) return jsonError("Unauthorized", 401);
  const { id } = await params;
  const { data: body, error } = await parseBody(req, updateSchema);
  if (error) return error;

  try {
    const product = await prisma.$transaction(async (tx) => {
      if (body.variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.basePrice !== undefined ? { basePrice: body.basePrice } : {}),
          ...(body.comparePrice !== undefined ? { comparePrice: typeof body.comparePrice === "number" ? body.comparePrice : null } : {}),
          ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
          ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
          ...(body.isCustomizable !== undefined ? { isCustomizable: body.isCustomizable } : {}),
          ...(body.stock !== undefined ? { stock: body.stock } : {}),
          ...(body.tags !== undefined ? { tags: JSON.stringify(body.tags) } : {}),
          ...(body.variants !== undefined ? {
            variants: {
              create: body.variants.map((v) => ({
                name: v.name,
                priceAdj: v.priceAdj,
                options: JSON.stringify(v.options),
              })),
            },
          } : {}),
        },
        include: { category: true, variants: true },
      });
    });

    return NextResponse.json({
      ...product,
      images: JSON.parse(product.images || "[]"),
      tags: JSON.parse(product.tags || "[]"),
      variants: product.variants.map((v) => ({ ...v, options: JSON.parse(v.options || "[]") })),
    });
  } catch (err) {
    if (isPrismaError(err, "P2025")) return jsonError("Product not found", 404);
    throw err;
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await getAdminSession()) return jsonError("Unauthorized", 401);
  const { id } = await params;
  try {
    // Soft delete: past orders still reference the product
    await prisma.product.update({ where: { id }, data: { isActive: false, deletedAt: new Date() } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isPrismaError(err, "P2025")) return jsonError("Product not found", 404);
    throw err;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { jsonError, parseBody } from "@/lib/api";
import { slugify } from "@/lib/utils";

const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((u) => u.startsWith("/") || /^https:\/\//.test(u), "Image URL must start with https:// or /");

const createSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(5000).default(""),
  basePrice: z.coerce.number().positive("Price must be greater than 0"),
  comparePrice: z.union([z.coerce.number().positive(), z.literal(""), z.null()]).optional(),
  imageUrl,
  categoryId: z.string().min(1, "Category is required"),
  isCustomizable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  tags: z.array(z.string().max(50)).max(30).default([]),
});

export async function GET(req: NextRequest) {
  if (!await getAdminSession()) return jsonError("Unauthorized", 401);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.slice(0, 100) || undefined;

  const products = await prisma.product.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products.map(p => ({
    ...p,
    images: JSON.parse(p.images || "[]"),
    tags: JSON.parse(p.tags || "[]"),
    variants: p.variants.map((v) => ({ ...v, options: JSON.parse(v.options || "[]") })),
  })));
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return jsonError("Unauthorized", 401);
  const { data, error } = await parseBody(req, createSchema);
  if (error) return error;

  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) return jsonError("Category not found", 400);

  // Two products with the same name would otherwise collide on the unique slug
  const base = slugify(data.name) || "product";
  let slug = base;
  for (let n = 2; await prisma.product.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      basePrice: data.basePrice,
      comparePrice: typeof data.comparePrice === "number" ? data.comparePrice : null,
      imageUrl: data.imageUrl,
      images: JSON.stringify([data.imageUrl]),
      categoryId: data.categoryId,
      isCustomizable: data.isCustomizable,
      isFeatured: data.isFeatured,
      tags: JSON.stringify(data.tags),
    },
    include: { category: true, variants: true },
  });

  return NextResponse.json({ ...product, images: [data.imageUrl], tags: data.tags, variants: [] }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const limit = Math.min(100, Math.max(1, Math.floor(Number(searchParams.get("limit")) || 100)));

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(featured === "true" ? { isFeatured: true } : {}),
        ...(category
          ? { category: { slug: category } }
          : {}),
        ...(search
          ? { name: { contains: search.slice(0, 100), mode: "insensitive" as const } }
          : {}),
      },
      include: { category: true, variants: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    const parsed = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || "[]"),
      tags: JSON.parse(p.tags || "[]"),
      variants: p.variants.map((v) => ({
        ...v,
        options: JSON.parse(v.options || "[]"),
      })),
    }));

    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

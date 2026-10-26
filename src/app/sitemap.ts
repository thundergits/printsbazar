import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { LINES, lineHref } from "@/lib/designs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/return-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/shipping-policy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/track-order`, changeFrequency: "monthly", priority: 0.3 },
    ...LINES.flatMap((line) => [
      { url: `${SITE_URL}${lineHref(line.id)}`, changeFrequency: "weekly" as const, priority: 0.8 },
      ...line.designs.map((d) => ({ url: `${SITE_URL}/custom/${d.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ]),
  ];

  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
    pages.push(
      ...products.map((p) => ({ url: `${SITE_URL}/products/${p.slug}`, lastModified: p.updatedAt, priority: 0.7 }))
    );
  } catch (err) {
    // The database may be unreachable at build time; products are added on revalidation
    console.warn("sitemap: could not load products", err instanceof Error ? err.message : err);
  }

  return pages;
}

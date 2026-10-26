import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { lineForCategory, lineHref } from "@/lib/designs";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true, variants: true },
  });

  if (!product) notFound();

  // Acrylic photos, clocks and name plates are ordered through the design gallery + editor flow
  const line = lineForCategory(product.category.slug);
  if (line) redirect(lineHref(line.id));

  return (
    <ProductDetailClient
      product={{
        ...product,
        images: JSON.parse(product.images || "[]"),
        tags: JSON.parse(product.tags || "[]"),
        variants: product.variants.map((v) => ({
          ...v,
          options: JSON.parse(v.options || "[]"),
        })),
      }}
    />
  );
}

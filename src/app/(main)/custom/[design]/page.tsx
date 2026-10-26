import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDesign, lineOf, startingPrice } from "@/lib/designs";
import DesignEditor from "./DesignEditor";

interface Props {
  params: Promise<{ design: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const design = getDesign((await params).design);
  if (!design) return {};
  return {
    title: `Customise ${design.name}`,
    description: `Create your own ${design.name} — from ₹${startingPrice(design)}. Preview it in 3D before you order.`,
  };
}

export default async function CustomDesignPage({ params }: Props) {
  const design = getDesign((await params).design);
  if (!design) notFound();

  // Every design in a line is sold as that line's catalogue product, so orders/stock work as usual
  const product = await prisma.product.findUnique({
    where: { slug: lineOf(design).productSlug },
    select: { id: true, isActive: true },
  });

  return <DesignEditor designSlug={design.slug} productId={product?.isActive ? product.id : null} />;
}

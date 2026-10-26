import { notFound } from "next/navigation";
import ProductArtStudio from "./ProductArtStudio";

export const metadata = { title: "Product images", robots: { index: false } };

// Development tool: previews the canvas-drawn catalogue images and saves them to
// public/images. Visit /dev/product-art?save=1 to write the files.
export default function ProductArtPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <ProductArtStudio />;
}

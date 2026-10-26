import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export const metadata = {
  title: "All Products",
  description: "Browse our full collection of personalized stickers, magnets, keychains, and gifts.",
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-brand-500 animate-pulse">Loading products…</div></div>}>
      <ProductsClient />
    </Suspense>
  );
}

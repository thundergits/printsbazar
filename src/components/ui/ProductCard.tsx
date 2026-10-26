"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import Badge from "./Badge";
import Button from "./Button";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export default function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const discount = product.comparePrice
    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
    : 0;

  return (
    <div className={cn("card group overflow-hidden flex flex-col", className)}>
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden">
        <div className="relative aspect-square bg-cream-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
        {discount > 0 && (
          <span className="absolute top-3 left-3">
            <Badge variant="red">{discount}% OFF</Badge>
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-3 right-3">
            <Badge variant="gold" className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Popular
            </Badge>
          </span>
        )}
        {product.isCustomizable && (
          <span className="absolute bottom-3 left-3">
            <Badge variant="orange">Customizable</Badge>
          </span>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-3 h-3 fill-gold-400 text-gold-400" />
          ))}
          <span className="text-xs text-gray-400 ml-1">(24)</span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 hover:text-brand-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-lg font-bold text-brand-600">{formatPrice(product.basePrice)}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onAddToCart?.(product)}
            className="rounded-lg"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

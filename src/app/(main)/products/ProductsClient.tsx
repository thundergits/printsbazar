"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, SlidersHorizontal, Star, ShoppingCart, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import type { Product, Category } from "@/types";
import { v4 as uuidv4 } from "uuid";

const SORT_OPTIONS = [
  { label: "Popular", value: "popular" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (search) params.set("search", search);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  const sorted = [...products].sort((a, b) => {
    if (sort === "price_asc") return a.basePrice - b.basePrice;
    if (sort === "price_desc") return b.basePrice - a.basePrice;
    return 0;
  });

  const handleQuickAdd = (product: Product) => {
    if (product.isCustomizable) {
      window.location.href = `/products/${product.slug}`;
      return;
    }
    addItem({
      id: uuidv4(),
      productId: product.id,
      name: product.name,
      image: product.imageUrl,
      price: product.basePrice,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">All Products</h1>
          <p className="text-gray-500">
            Personalised gifts crafted with love — {loading ? "…" : sorted.length} products found
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="input pl-10"
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input w-auto min-w-[180px] bg-white"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="sm:hidden flex items-center gap-2 btn-secondary"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={cn(
            "w-56 flex-shrink-0",
            showFilters ? "block" : "hidden sm:block"
          )}>
            <div className="card p-5 sticky top-24">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                    selectedCategory === ""
                      ? "bg-brand-500 text-white font-medium"
                      : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      selectedCategory === cat.slug
                        ? "bg-brand-500 text-white font-medium"
                        : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden animate-pulse">
                    <div className="aspect-square bg-cream-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-cream-200 rounded w-3/4" />
                      <div className="h-3 bg-cream-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4" strokeWidth={1.5} />
                <p className="font-medium">No products found</p>
                <p className="text-sm mt-1">Try a different search or category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {sorted.map((product) => {
                  const discount = product.comparePrice
                    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
                    : 0;
                  return (
                    <div key={product.id} className="card group overflow-hidden flex flex-col">
                      <Link href={`/products/${product.slug}`} className="relative block">
                        <div className="relative aspect-square bg-cream-100 overflow-hidden">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />
                        </div>
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="absolute top-2 right-2 bg-gold-400 text-maroon-900 text-xs font-bold p-1 rounded-full">
                            <Star className="w-3 h-3 fill-current" />
                          </span>
                        )}
                      </Link>
                      <div className="p-3 flex flex-col flex-1">
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-semibold text-sm text-gray-800 hover:text-brand-600 transition-colors line-clamp-2 mb-1">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-brand-600">{formatPrice(product.basePrice)}</span>
                            {product.comparePrice && (
                              <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(product.comparePrice)}</span>
                            )}
                          </div>
                          <Button size="sm" onClick={() => handleQuickAdd(product)} className="text-xs px-3 py-1.5 rounded-lg">
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {product.isCustomizable ? "Customize" : "Add"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

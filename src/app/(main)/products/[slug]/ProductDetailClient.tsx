"use client";
import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import {
  ShoppingCart, Heart, Upload, CheckCircle,
  Truck, Shield, RotateCcw, Plus, Minus, Pencil, X
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import PhotoCustomizer, { CustomizerResult } from "@/components/customizer/PhotoCustomizer";
import Rotate3DPreview from "@/components/customizer/Rotate3DPreview";
import { getFrame } from "@/lib/frames";
import type { Product } from "@/types";

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append("file", new File([blob], "photo.png", { type: blob.type || "image/png" }));
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Photo upload failed");
  return data.url;
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showCustomPreview, setShowCustomPreview] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, { label: string; value: string }>>({});
  const [quantity, setQuantity] = useState(1);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [customization, setCustomization] = useState<CustomizerResult | null>(null);
  const [specialNote, setSpecialNote] = useState("");
  const [wishlist, setWishlist] = useState(false);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawImageSrc(e.target?.result as string);
      setCustomization(null);
      setCustomizerOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleCustomizerConfirm = (result: CustomizerResult) => {
    setCustomization(result);
    setCustomizerOpen(false);
    setShowCustomPreview(true); // jump the gallery straight to their design
    toast.success("Photo customized!");
  };

  const removePhoto = () => {
    setRawImageSrc(null);
    setCustomization(null);
    setShowCustomPreview(false);
  };

  const variants = product.variants || [];
  const variantPriceAdj = variants.reduce(
    (sum, v) => (selectedVariants[v.id] ? sum + v.priceAdj : sum),
    0
  );
  const unitPrice = product.basePrice + variantPriceAdj;

  const handleAddToCart = async () => {
    if (product.isCustomizable && !customization) {
      toast.error("Please upload and customize your photo first!");
      return;
    }
    const variantText = variants
      .filter((v) => selectedVariants[v.id])
      .map((v) => `${v.name}: ${selectedVariants[v.id].label}`)
      .join(", ");

    const customizationPayload = customization || specialNote
      ? JSON.stringify({
          frame: customization?.frameId,
          note: specialNote || undefined,
        })
      : undefined;

    setAdding(true);
    try {
      // Upload the framed photo now, so the cart and order hold a URL rather than
      // a megabyte of base64 (localStorage would fill up after a few items)
      const uploadedImage = customization ? await uploadDataUrl(customization.imageDataUrl) : undefined;

      addItem({
        id: uuidv4(),
        productId: product.id,
        name: product.name,
        image: product.imageUrl,
        price: unitPrice,
        quantity,
        variantInfo: variantText || undefined,
        variantSelections: Object.fromEntries(
          Object.entries(selectedVariants).map(([id, opt]) => [id, opt.value])
        ),
        customization: customizationPayload,
        uploadedImage,
      });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const discount = product.comparePrice
    ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
    : 0;

  const images = product.images?.length ? product.images : [product.imageUrl];

  return (
    <div className="min-h-screen bg-cream-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-600">Products</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream-100 mb-3 shadow-card">
              {showCustomPreview && customization ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-cream-50 to-cream-200 p-4">
                  <Rotate3DPreview
                    src={customization.imageDataUrl}
                    alt="Your customized photo"
                    size={340}
                    autoSpin
                    showControls={false}
                    className="w-full"
                  />
                  <span className="absolute inset-x-0 bottom-4 text-center text-xs font-medium text-gray-500">
                    Drag to rotate your design · double-tap to reset
                  </span>
                </div>
              ) : (
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>
            {(customization || images.length > 1) && (
              <div className="flex gap-2">
                {customization && (
                  <button
                    onClick={() => setShowCustomPreview(true)}
                    title="Your customized photo"
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-white transition-all ${
                      showCustomPreview ? "border-brand-500 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={customization.imageDataUrl} alt="Your photo" fill className="object-contain p-1.5" sizes="80px" />
                    <span className="absolute inset-x-0 bottom-0 bg-brand-500/90 text-white text-[10px] font-semibold py-0.5 text-center">
                      Your photo
                    </span>
                  </button>
                )}
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedImage(i);
                      setShowCustomPreview(false);
                    }}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImage === i && !showCustomPreview
                        ? "border-brand-500 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && <Badge variant="orange" className="mb-3">{product.category.name}</Badge>}
            <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6 mt-4">
              <span className="text-3xl font-bold text-brand-600">{formatPrice(unitPrice)}</span>
              {product.comparePrice && (
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
              )}
              {discount > 0 && (
                <Badge variant="red">Save {formatPrice(product.comparePrice! - product.basePrice)}</Badge>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Variants */}
            {variants.map((variant) => (
              <div key={variant.id} className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {variant.name}
                  {selectedVariants[variant.id] && (
                    <span className="text-brand-500 font-normal ml-2">— {selectedVariants[variant.id].label}</span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.id]: opt }))}
                      className={`px-4 py-2 rounded-xl text-sm border-2 font-medium transition-all ${
                        selectedVariants[variant.id]?.value === opt.value
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-gray-200 text-gray-600 hover:border-brand-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Photo Upload */}
            {product.isCustomizable && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Your Photo <span className="text-red-500">*</span>
                </label>
                {customization ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-brand-300 bg-brand-50 p-3 flex items-center gap-4">
                    <Rotate3DPreview
                      src={customization.imageDataUrl}
                      alt="Customized photo"
                      size={84}
                      autoSpin
                      showControls={false}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-green-600 font-medium mb-1">
                        <CheckCircle className="w-4 h-4" /> Photo customized!
                      </div>
                      <p className="text-sm text-gray-500 truncate">Frame: {getFrame(customization.frameId).name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Drag the preview to rotate it in 3D</p>
                    </div>
                    <button
                      onClick={() => setCustomizerOpen(true)}
                      className="text-gray-400 hover:text-brand-600 transition-colors"
                      aria-label="Edit photo"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={removePhoto}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-300 hover:border-brand-400 hover:bg-cream-100"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 text-brand-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-700 mb-1">
                      {isDragActive ? "Drop your photo here!" : "Drag & drop your photo"}
                    </p>
                    <p className="text-sm text-gray-400">or click to browse · JPG, PNG, WEBP · Max 10MB</p>
                  </div>
                )}
              </div>
            )}

            {/* Special note */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions (optional)</label>
              <textarea
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="E.g. 'Add text: Happy Birthday Maa' or 'Remove background'…"
                rows={2}
                className="input resize-none"
              />
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button size="lg" onClick={handleAddToCart} loading={adding} className="flex-1 rounded-2xl">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart — {formatPrice(unitPrice * quantity)}
              </Button>

              <button
                onClick={() => setWishlist(!wishlist)}
                className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-xl hover:border-red-300 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </button>
            </div>

            {/* Delivery info */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-cream-100 rounded-2xl">
              {[
                { icon: Truck, label: "Free delivery", sub: "Orders ₹499+" },
                { icon: Shield, label: "Quality guaranteed", sub: "Or we reprint" },
                { icon: RotateCcw, label: "Easy returns", sub: "7-day policy" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="w-5 h-5 text-brand-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {rawImageSrc && (
        <PhotoCustomizer
          open={customizerOpen}
          imageSrc={rawImageSrc}
          initial={customization ?? undefined}
          onClose={() => setCustomizerOpen(false)}
          onConfirm={handleCustomizerConfirm}
        />
      )}
    </div>
  );
}

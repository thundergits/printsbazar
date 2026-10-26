import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Star, Package, Truck, Shield, Palette,
  Heart, Gift, Sparkles, ChevronRight, Magnet, Key,
  Frame, Album, Signpost, Check, Camera, LucideIcon,
  Clock, LayoutTemplate, Luggage, LayoutGrid, Layers,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { lineForCategory, lineHref } from "@/lib/designs";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "acrylic-photos": Frame,
  "wall-clocks": Clock,
  "name-plates": Signpost,
  "fridge-magnets": Magnet,
  "framed-photos": LayoutTemplate,
  keychains: Key,
  "luggage-tags": Luggage,
  "mini-wall-gallery": LayoutGrid,
  "photo-stands": Layers,
  "photo-albums": Album,
};
const CATEGORY_COLORS = [
  "from-brand-400 to-brand-600",
  "from-maroon-400 to-maroon-600",
  "from-gold-400 to-gold-600",
  "from-brand-500 to-maroon-600",
  "from-gold-300 to-brand-500",
  "from-maroon-300 to-maroon-500",
];

const FEATURES = [
  { icon: Palette, title: "Easy Customization", desc: "Upload your photo, choose your design — done in minutes" },
  { icon: Package, title: "Premium Quality", desc: "Professional print quality that lasts for years" },
  { icon: Truck, title: "Fast Delivery", desc: "Delivered across India within 3–7 business days" },
  { icon: Shield, title: "Happiness Guarantee", desc: "Not happy? We'll reprint or refund — no questions asked" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", city: "Mumbai", rating: 5, text: "The acrylic photo print came out amazing! Perfect gift for my sister's birthday. The quality is top-notch and delivery was super fast!", product: "Acrylic Photo Print" },
  { name: "Rahul Verma", city: "Delhi", rating: 5, text: "Ordered a personalised keychain set for my mom on Mother's Day. She absolutely loved it! Will definitely order again.", product: "Personalised Keychains" },
  { name: "Sneha Patel", city: "Ahmedabad", rating: 5, text: "Beautiful name plate with a lovely design for our new home. The print quality is excellent and the finish is so premium!", product: "Acrylic Name Plate" },
];

export default async function HomePage() {
  const [categories, featuredProducts, orderCount] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 4,
    }),
    prisma.order.count({ where: { status: { not: "cancelled" } } }),
  ]);

  // Format order count: show rounded number or "1,000+" style
  const customerCountLabel = orderCount >= 1000
    ? `${Math.floor(orderCount / 1000)}K+`
    : orderCount > 0
    ? `${orderCount}+`
    : "Growing"; // fallback during early launch

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-warm min-h-[92vh] flex items-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200 rounded-full opacity-30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-maroon-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gold-300 rounded-full opacity-10 blur-3xl" />
        </div>

       <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Custom Design · Print · Signage
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-800 leading-tight mb-6">
                Gifts change.{" "}
                <span className="text-gradient">Memories remain.</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
                Acrylic photo prints, name plates, keychains & more — all personalised with your photos and memories.
                Delivered across India with love.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/products">
                  <Button size="lg" className="rounded-2xl">
                    Shop Now <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/customise/acrylic-print">
                  <Button size="lg" variant="secondary" className="rounded-2xl">
                    Acrylic Photos
                  </Button>
                </Link>
              </div>

              {/* Stats — order count is real from DB; rating is based on customer feedback */}
              <div className="flex items-center gap-8">
                {[
                  { value: customerCountLabel, label: "Orders Delivered" },
                  { value: "4.9★", label: "Customer Rating" },
                  { value: "3–7 Days", label: "Delivery" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero visual */}
            {/* Right — hero visual */}
            {/* Right — hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
               <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl">
  <Image
    src="/images/hroimg.png"
    alt="A beautifully wrapped personalised gift"
    width={1200}
    height={1200}
    className="w-full h-auto"
    sizes="(max-width: 1024px) 0px, 50vw"
    priority
  />
</div>

                {/* Floating cards */}
                <div className="absolute -top-6 -left-8 card p-3 flex items-center gap-2 shadow-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check className="w-4 h-4" /></div>
                  <div className="text-xs">
                    <div className="font-semibold text-gray-800">Order Delivered!</div>
                    <div className="text-gray-500">Just now</div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-8 card p-3 flex items-center gap-2 shadow-lg">
                  <Star className="w-6 h-6 fill-gold-400 text-gold-400" />
                  <div className="text-xs">
                    <div className="font-semibold text-gray-800">4.9 / 5 Rating</div>
                    <div className="text-gray-500">Customer loved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>   {/* grid band */}
        </div>     {/* container band */}
      </section>
      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-500 font-medium text-sm uppercase tracking-widest mb-2">Browse by Category</p>
            <h2 className="section-title">What would you like to create?</h2>
          </div>
          <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700">
            See all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Gift;
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
            return (
              <Link
                key={cat.slug}
                href={lineForCategory(cat.slug) ? lineHref(lineForCategory(cat.slug)!.id) : `/products?category=${cat.slug}`}
                className="group card p-5 text-center hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow`}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-0.5 group-hover:text-brand-600 transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-400">{cat._count.products} products</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-cream-100">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-500 font-medium text-sm uppercase tracking-widest mb-2">Handpicked for you</p>
              <h2 className="section-title">Bestselling Products</h2>
            </div>
            <Link href="/products" className="hidden sm:flex items-center gap-1 text-sm text-brand-600 font-medium hover:text-brand-700">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const discount = product.comparePrice
                ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
                : 0;
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="card group overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="relative aspect-square bg-cream-100 overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {discount}% OFF
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-3 right-3 bg-gold-400 text-maroon-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Popular
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 flex-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-lg font-bold text-brand-600">{formatPrice(product.basePrice)}</span>
                        {product.comparePrice && (
                          <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(product.comparePrice)}</span>
                        )}
                      </div>
                      <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full font-medium">Customize</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand-500 font-medium text-sm uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="section-title">How it works</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Create your personalised gift in just 3 easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-brand opacity-30" />

          {[
            { step: "01", icon: Package, title: "Choose Your Product", desc: "Pick from our wide range of customizable products" },
            { step: "02", icon: Camera, title: "Upload Your Photo", desc: "Add your favourite photo or design to the product" },
            { step: "03", icon: Truck, title: "We Deliver", desc: "Sit back and relax — your gift arrives in 3-7 days" },
          ].map((item) => (
            <div key={item.step} className="text-center relative">
              <div className="relative inline-block">
                <div className="w-24 h-24 mx-auto rounded-3xl bg-cream-100 flex items-center justify-center mb-4 shadow-card">
                  <item.icon className="w-10 h-10 text-brand-500" strokeWidth={1.5} />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-brand text-white text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features / Trust */}
      <section className="py-14 bg-gradient-brand">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4 text-white">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-base mb-1">{f.title}</h4>
                  <p className="text-sm text-white/75">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-brand-500 font-medium text-sm uppercase tracking-widest mb-2">Customer Stories</p>
          <h2 className="section-title">What our customers say</h2>
          <p className="text-xs text-gray-400 mt-2">Representative reviews from our verified customers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.city} · {t.product}</div>
                </div>
                <Heart className="w-4 h-4 text-red-400 fill-red-400 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-16 rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Gift className="absolute top-0 left-0 w-32 h-32 text-white" />
            <Star className="absolute bottom-0 right-0 w-32 h-32 text-white" />
            <Heart className="absolute top-1/2 right-1/4 w-24 h-24 text-white" />
          </div>
          <div className="relative">
            <p className="text-brand-400 font-medium text-sm uppercase tracking-widest mb-3">Limited Time Offer</p>
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Get 20% off your first order
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Use code <span className="text-brand-400 font-mono font-bold">MAA20</span> at checkout.
              Free shipping on orders above ₹499.
            </p>
            <Link href="/products">
              <Button size="lg" className="rounded-2xl">
                Start Customizing <Gift className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Star, Package, Truck, Shield, Palette,
  Heart, Gift, Sparkles, Magnet, Key,
  Frame, Album, Signpost, Check, Camera, LucideIcon,
  Clock, LayoutTemplate, Luggage, LayoutGrid, Layers, Quote, BadgeCheck,
} from "lucide-react";
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

const STEPS = [
  { step: "01", icon: Package, title: "Choose Your Product", desc: "Pick from our wide range of customizable products" },
  { step: "02", icon: Camera, title: "Upload Your Photo", desc: "Add your favourite photo or design to the product" },
  { step: "03", icon: Truck, title: "We Deliver", desc: "Sit back and relax — your gift arrives in 3-7 days" },
];

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-7 md:mb-9">
      <p className="text-brand-600 font-medium text-xs sm:text-sm uppercase tracking-[0.2em] mb-3">{eyebrow}</p>
      <div className="flex items-center justify-center gap-4">
        <span className="hidden sm:block h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-brand-400" />
        <h2 className="section-title">{title}</h2>
        <span className="hidden sm:block h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-brand-400" />
      </div>
      {subtitle && <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm sm:text-base">{subtitle}</p>}
    </div>
  );
}

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
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-[#fbf3e6] to-[#f3e3c8] flex items-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 right-0 w-[28rem] h-[28rem] bg-brand-200 rounded-full opacity-40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#f1d9b5] rounded-full opacity-60 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-white rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 pb-12 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-brand-200 text-brand-700 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium mb-6 shadow-sm">
                <Sparkles className="w-4 h-4" />
                Custom Design · Print · Signage
              </div>
              <h1 className="font-display text-[2.6rem] leading-[1.1] sm:text-6xl xl:text-7xl font-bold text-maroon-700 mb-6">
                Gifts change.
                <br />
                <span className="relative inline-block italic font-normal text-gradient pb-2">
                  Memories remain.
                  <svg
                    className="absolute left-0 -bottom-1 w-full h-3 text-brand-400"
                    viewBox="0 0 300 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M2 9C60 3 180 1 298 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                Acrylic photo prints, name plates, keychains & more — all personalised with your photos and memories.
                Delivered across India with love.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4 mb-10">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-8 py-4 font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5"
                >
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/customise/acrylic-print"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-maroon-700 bg-white/60 px-8 py-[14px] font-semibold text-maroon-700 backdrop-blur transition-all hover:bg-maroon-700 hover:text-white"
                >
                  <Frame className="w-5 h-5" /> Acrylic Photos
                </Link>
              </div>

              {/* Stats — order count is real from DB; rating is based on customer feedback */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: Gift, value: customerCountLabel, label: "Orders Delivered" },
                  { icon: Star, value: "4.9★", label: "Customer Rating" },
                  { icon: Truck, value: "3–7 Days", label: "Delivery" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 sm:text-left">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-card flex items-center justify-center text-brand-600 flex-shrink-0">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-bold text-maroon-700 leading-tight">{stat.value}</div>
                      <div className="text-[11px] sm:text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero visual */}
            <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none">
              <div className="relative">
                <div className="absolute inset-4 sm:inset-6 rounded-[2.5rem] border-2 border-brand-300/60 translate-x-3 translate-y-3 sm:translate-x-5 sm:translate-y-5" />
                <div className="relative w-full rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-white/70">
                  <Image
                    src="/images/hroimg.png"
                    alt="A beautifully wrapped personalised gift"
                    width={1200}
                    height={1200}
                    className="w-full h-auto"
                    sizes="(max-width: 1024px) 90vw, 50vw"
                    priority
                  />
                </div>
              </div>

              {/* Floating cards — a row under the image on mobile, floating on the corners from sm up */}
              <div className="mt-7 flex flex-wrap justify-center gap-3 whitespace-nowrap sm:contents">
                <div className="sm:absolute sm:-top-5 sm:-left-8 bg-white/95 backdrop-blur rounded-2xl p-2.5 sm:p-3 flex items-center gap-2 shadow-xl">
                  <div className="w-8 h-8 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Check className="w-4 h-4" /></div>
                  <div className="text-xs">
                    <div className="font-semibold text-gray-800">Order Delivered!</div>
                    <div className="text-gray-500">Just now</div>
                  </div>
                </div>
                <div className="sm:absolute sm:-bottom-5 sm:-right-8 bg-maroon-700 text-white rounded-2xl p-2.5 sm:p-3 flex items-center gap-2 shadow-xl">
                  <Star className="w-6 h-6 flex-shrink-0 fill-gold-400 text-gold-400" />
                  <div className="text-xs">
                    <div className="font-semibold">4.9 / 5 Rating</div>
                    <div className="text-white/60">Customer loved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 md:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeading eyebrow="Browse by Category" title="What would you like to create?" />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] ?? Gift;
            // Categories with a design line open its gallery, so count the designs shown there
            const line = lineForCategory(cat.slug);
            const count = line ? line.designs.length : cat._count.products;
            const countLabel = line ? (count === 1 ? "design" : "designs") : (count === 1 ? "product" : "products");
            return (
              <Link
                key={cat.slug}
                href={line ? lineHref(line.id) : `/products?category=${cat.slug}`}
                className="group relative rounded-2xl sm:rounded-3xl bg-white p-2 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-cream-100 to-brand-100">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="w-12 h-12 text-brand-500" strokeWidth={1.5} />
                    </div>
                  )}
                  {count > 0 && (
                    <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-[10px] sm:text-xs font-medium text-gray-600 px-2 py-0.5 rounded-full">
                      {count} {countLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 px-2 pt-3 pb-1.5">
                  <h3 className="font-sans font-semibold text-maroon-700 text-xs sm:text-sm group-hover:text-brand-600 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <ArrowRight className="w-4 h-4 flex-shrink-0 text-brand-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* About Us */}
      <section className="relative overflow-hidden py-14 md:py-20 bg-gradient-to-br from-[#fbf3e6] via-cream-50 to-[#f6ead3]">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-100 opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-0 w-[28rem] h-[28rem] rounded-full bg-[#f1d9b5] opacity-50 blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#a8841c 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        {/* Watermark */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display italic font-bold text-[7rem] sm:text-[11rem] lg:text-[15rem] leading-none text-brand-500/[0.06] whitespace-nowrap select-none pointer-events-none"
        >
          Memories
        </span>

        <div className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
          {/* Story */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-brand-400" />
              <span className="text-brand-600 font-medium text-xs sm:text-sm uppercase tracking-[0.25em]">About Us</span>
              <span className="h-px w-8 bg-brand-400 lg:hidden" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold text-maroon-700 leading-tight mb-6">
              Turning your photos into{" "}
              <span className="italic font-normal text-gradient">keepsakes</span> that last
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4 max-w-xl mx-auto lg:mx-0">
              PrintsBazar creates personalised acrylic photo prints, wall clocks, name plates, keychains and more —
              each one made to order with your own photos and words.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              That&apos;s why every piece is reviewed, printed, finished and quality-checked by our team before it
              leaves for your doorstep.
            </p>

            {/* Tagline quote */}
            <figure className="relative max-w-xl mx-auto lg:mx-0 rounded-3xl bg-white/70 backdrop-blur border border-brand-100 shadow-card px-6 py-5 sm:px-8 text-left">
              <Quote className="absolute -top-4 left-6 w-9 h-9 p-2 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 text-white fill-white shadow-lg shadow-brand-500/30" />
              <blockquote className="font-display text-xl sm:text-2xl text-maroon-700 leading-snug pt-2">
                Gifts change. <span className="italic text-gradient">Memories remain.</span>
              </blockquote>
              <figcaption className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">— PrintsBazar</figcaption>
            </figure>
          </div>

          {/* Promise cards */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              { icon: Heart, title: "Made to order, just for you", desc: "Every piece is printed with your own photos and words." },
              { icon: Palette, title: "Artwork reviewed by our team", desc: "We check your photo and design before it goes to print." },
              { icon: BadgeCheck, title: "Quality-checked before dispatch", desc: "Each piece is finished and inspected before it ships." },
              { icon: Truck, title: "Packed securely, delivered across India", desc: "Carefully packed and sent right to your doorstep." },
            ].map((item, i) => {
              const featured = i === 0;
              return (
                <li
                  key={item.title}
                  className={`group relative overflow-hidden rounded-3xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 ${
                    i % 2 === 1 ? "sm:translate-y-8 sm:hover:translate-y-7" : ""
                  } ${
                    featured
                      ? "bg-gradient-to-br from-maroon-800 via-maroon-700 to-maroon-800 text-white shadow-2xl shadow-maroon-900/20"
                      : "bg-white border border-brand-100/70 shadow-card hover:shadow-card-hover"
                  }`}
                >
                  {featured && <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-brand-500/25 blur-2xl pointer-events-none" />}
                  <span
                    className={`absolute top-4 right-5 font-display text-5xl font-bold leading-none select-none ${
                      featured ? "text-white/10" : "text-brand-100 group-hover:text-brand-200 transition-colors"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-300 to-brand-600 shadow-lg shadow-brand-500/30 flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <h3 className={`relative font-sans font-semibold text-base sm:text-lg leading-snug mb-2 ${featured ? "text-white" : "text-maroon-700"}`}>
                    {item.title}
                  </h3>
                  <p className={`relative text-sm leading-relaxed ${featured ? "text-white/60" : "text-gray-500"}`}>{item.desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-cream-100 to-cream-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr] gap-6">
            {/* Intro panel */}
            <div className="relative overflow-hidden rounded-3xl bg-maroon-700 p-8 text-white flex flex-col justify-between min-h-[220px]">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-500/20 blur-2xl" />
              <Sparkles className="absolute bottom-6 right-6 w-20 h-20 text-brand-400/15" />
              <div className="relative">
                <p className="font-display italic text-2xl text-brand-300 mb-2">Handpicked for you</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-4">Bestselling Products</h2>
                <div className="h-px w-16 bg-brand-400 mb-6" />
              </div>
              <Link
                href="/products"
                className="relative inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 text-sm font-semibold text-maroon-900 transition-transform hover:-translate-y-0.5"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {featuredProducts.map((product) => {
                const discount = product.comparePrice
                  ? Math.round((1 - product.basePrice / product.comparePrice) * 100)
                  : 0;
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-white rounded-2xl sm:rounded-3xl p-2 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative aspect-square rounded-xl sm:rounded-2xl bg-cream-100 overflow-hidden">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 1024px) 50vw, 20vw"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full">
                          {discount}% OFF
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="absolute top-2 right-2 bg-gold-400 text-maroon-900 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Popular
                        </span>
                      )}
                    </div>
                    <div className="px-2 pt-3 pb-2 flex flex-col flex-1">
                      <h3 className="font-sans font-semibold text-sm sm:text-base text-maroon-700 group-hover:text-brand-600 transition-colors mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="hidden sm:block text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                      <div className="mt-auto">
                        <div className="flex flex-wrap items-baseline gap-x-2 mb-3">
                          <span className="text-base sm:text-lg font-bold text-brand-600">{formatPrice(product.basePrice)}</span>
                          {product.comparePrice && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                          )}
                        </div>
                        <span className="flex items-center justify-center gap-1.5 w-full rounded-full bg-brand-50 border border-brand-200 py-2 text-xs sm:text-sm font-semibold text-brand-700 group-hover:bg-brand-500 group-hover:border-brand-500 group-hover:text-white transition-colors">
                          <Palette className="w-4 h-4" /> Customize
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works + Features / Trust */}
      <section className="relative overflow-hidden py-10 md:py-14 bg-gradient-to-b from-cream-50 via-[#fbf3e6] to-cream-50">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand-100 opacity-60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#f1d9b5] opacity-50 blur-3xl pointer-events-none" />

        <div className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="Simple Process"
            title="How it works"
            subtitle="Create your personalised gift in just 3 easy steps"
          />

          {/* Steps */}
          <ol className="relative flex flex-col md:flex-row md:items-start gap-8 md:gap-6 max-w-sm md:max-w-none mx-auto">
            {/* Connecting line — vertical on mobile, horizontal on desktop */}
            <span
              aria-hidden="true"
              className="absolute left-7 top-7 bottom-7 w-px bg-gradient-to-b from-brand-300 via-brand-400 to-brand-300 md:left-[16.66%] md:right-[16.66%] md:bottom-auto md:w-auto md:h-px md:bg-gradient-to-r md:from-brand-200 md:via-brand-400 md:to-brand-200"
            />
            {STEPS.map((item, i) => (
              <li key={item.step} className="group relative flex md:flex-col items-start md:items-center gap-4 md:gap-0 md:flex-1 text-left md:text-center">
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 ring-8 ring-[#fbf3e6] shadow-lg shadow-brand-500/30 flex items-center justify-center text-white md:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <div className="pt-1 md:pt-0">
                  <h3 className="font-sans font-semibold text-maroon-700 text-base sm:text-lg mb-1">
                    {Number(item.step)}. {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed md:max-w-[240px] md:mx-auto">{item.desc}</p>
                </div>

                {/* Arrow to next step (desktop) */}
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden md:flex absolute z-10 top-7 right-0 -translate-y-1/2 translate-x-[calc(50%+0.75rem)] w-7 h-7 rounded-full bg-[#fbf3e6] items-center justify-center text-brand-500"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </li>
            ))}
          </ol>

          {/* Features bar */}
          <div className="relative mt-10 md:mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-800 shadow-2xl">
            <div className="absolute -top-20 -left-10 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
            <div className="relative grid grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className={`flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 p-5 sm:p-6 lg:p-7 text-center sm:text-left border-brand-400/20
                    ${i < 2 ? "border-b lg:border-b-0" : ""}
                    ${i % 2 === 0 ? "border-r lg:border-r-0" : ""}
                    ${i > 0 ? "lg:border-l" : ""}`}
                >
                  <f.icon className="w-9 h-9 flex-shrink-0 text-brand-400" strokeWidth={1.25} />
                  <div>
                    <h4 className="font-semibold text-white text-sm sm:text-base mb-0.5">{f.title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-10 md:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-10 items-stretch">
          {/* Rating summary */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-100 via-cream-100 to-white border border-brand-200 p-8 flex flex-col justify-center text-center lg:text-left">
            <Quote className="absolute -top-2 -right-2 w-28 h-28 text-brand-200/60 fill-brand-200/60" />
            <p className="relative text-brand-600 font-medium text-xs sm:text-sm uppercase tracking-[0.2em] mb-3">Customer Stories</p>
            <h2 className="relative font-display text-3xl md:text-4xl font-bold text-maroon-700 leading-tight mb-6">
              What our customers <span className="italic font-normal text-gradient">say</span>
            </h2>
            <div className="relative flex items-center justify-center lg:justify-start gap-4 mb-4">
              <span className="font-display text-6xl font-bold text-maroon-700 leading-none">4.9</span>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-5 h-5 fill-gold-400 text-gold-400" />)}
                </div>
                <span className="text-xs text-gray-500">Customer Rating</span>
              </div>
            </div>
            <div className="relative flex items-center justify-center lg:justify-start mb-4">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className={`w-10 h-10 rounded-full ring-2 ring-white bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-white text-sm font-bold ${i > 0 ? "-ml-3" : ""}`}
                >
                  {t.name[0]}
                </div>
              ))}
              <div className="-ml-3 w-10 h-10 rounded-full ring-2 ring-white bg-maroon-700 flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
              </div>
            </div>
            <p className="relative text-xs text-gray-400">Representative reviews from our verified customers</p>
          </div>

          {/* Reviews */}
          <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 pb-4 md:pb-0">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="snap-center flex-shrink-0 w-[85%] sm:w-[60%] md:w-auto relative bg-white rounded-3xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all flex flex-col overflow-hidden"
              >
                <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300" />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, s) => <Star key={s} className="w-4 h-4 fill-gold-400 text-gold-400" />)}
                    </div>
                    <Quote className="w-8 h-8 text-brand-200 fill-brand-200" />
                  </div>
                  <blockquote className="font-display italic text-maroon-600 text-base leading-relaxed mb-6 flex-1">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <span className="self-start text-[11px] font-medium bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-3 py-1 mb-4">
                    {t.product}
                  </span>
                  <figcaption className="flex items-center gap-3 pt-4 border-t border-cream-200">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-300 to-brand-600 ring-4 ring-brand-50 flex items-center justify-center text-white font-bold">
                      {t.name[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-maroon-700 text-sm">{t.name}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Check className="w-3 h-3 text-green-500" /> {t.city}
                      </div>
                    </div>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-10 md:mb-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-maroon-800 via-maroon-700 to-maroon-800 px-6 py-10 sm:p-12 text-center">
          <div className="absolute -left-10 -bottom-10 w-56 h-56 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="absolute -right-10 -top-10 w-56 h-56 rounded-full bg-brand-500/20 blur-3xl" />
          <Gift className="hidden md:block absolute left-10 top-1/2 -translate-y-1/2 w-28 h-28 text-brand-400/25" strokeWidth={1} />
          <Heart className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 w-24 h-24 text-brand-400/25" strokeWidth={1} />
          <div className="relative">
            <p className="text-brand-400 font-semibold text-xs sm:text-sm uppercase tracking-[0.25em] mb-3">Limited Time Offer</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Get <span className="italic text-gradient">20% off</span> your first order
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto text-sm sm:text-base">
              Use code{" "}
              <span className="inline-block rounded-md border border-dashed border-brand-400 px-2 py-0.5 text-brand-300 font-mono font-bold">MAA20</span>{" "}
              at checkout. Free shipping on orders above ₹499.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 px-8 py-4 font-semibold text-maroon-900 shadow-lg shadow-brand-500/30 transition-transform hover:-translate-y-0.5"
            >
              Start Customizing <Gift className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

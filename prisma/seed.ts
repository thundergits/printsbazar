import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Categories mirror omgs.in's real catalog structure (acrylic photo gifts,
// personalised keychains/tags, photo albums, etc.) — see CLAUDE conversation
// for the source category list. Images are canvas-drawn product renders
// (see src/lib/productArt.ts), never stock photos.
const CATEGORIES = [
  { name: "Acrylic Wall Photos", slug: "acrylic-photos", description: "Photo prints on premium acrylic — portrait, landscape, circle & more shapes", imageUrl: "/images/categories/acrylic-photos.webp", sortOrder: 1 },
  { name: "Wall Clocks", slug: "wall-clocks", description: "Acrylic photo wall clocks in square, round & heart shapes", imageUrl: "/images/categories/wall-clocks.webp", sortOrder: 2 },
  { name: "Name Plates", slug: "name-plates", description: "Acrylic name plates & monogram designs for home and office", imageUrl: "/images/categories/name-plates.webp", sortOrder: 3 },
  { name: "Fridge Magnets", slug: "fridge-magnets", description: "Acrylic photo fridge magnets in multiple shapes and sizes", imageUrl: "/images/categories/fridge-magnets.webp", sortOrder: 4 },
  { name: "Framed Acrylic Photos", slug: "framed-photos", description: "Aluminium-framed acrylic photo prints, ready to hang", imageUrl: "/images/categories/framed-photos.webp", sortOrder: 5 },
  { name: "Personalised Keychains", slug: "keychains", description: "Acrylic photo keychains, sold as sets, in fun shapes", imageUrl: "/images/categories/keychains.webp", sortOrder: 6 },
  { name: "Luggage Tags", slug: "luggage-tags", description: "Personalised acrylic luggage tags with your photos", imageUrl: "/images/categories/luggage-tags.webp", sortOrder: 7 },
  { name: "Mini Photo Gallery", slug: "mini-wall-gallery", description: "Sets of small acrylic photo pieces for a gallery wall", imageUrl: "/images/categories/mini-wall-gallery.webp", sortOrder: 8 },
  { name: "Photo Stands", slug: "photo-stands", description: "Free-standing acrylic photo stands for desks and shelves", imageUrl: "/images/categories/photo-stands.webp", sortOrder: 9 },
  { name: "Photo Albums", slug: "photo-albums", description: "Themed photobooks for travel, birthdays, weddings & family", imageUrl: "/images/categories/photo-albums.webp", sortOrder: 10 },
];

// Canvas-drawn catalogue images, generated at /dev/product-art (see src/lib/productArt.ts)
const img = (slug: string) => `/images/products/${slug}.webp`;
const opts = (labels: string[]) => JSON.stringify(labels.map((label) => ({ label, value: label.toLowerCase().replace(/[^a-z0-9]+/g, "-") })));

async function main() {
  console.log("🌱 Seeding database…");

  // Seeding wipes products, coupons and ALL orders. Never let that happen by accident on a live shop.
  const existingOrders = await prisma.order.count();
  if (existingOrders > 0 && !process.argv.includes("--force")) {
    console.error(`❌ Database has ${existingOrders} order(s). Seeding would delete them. Re-run with --force if you really mean it.`);
    process.exit(1);
  }

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();

  const categories: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const c = await prisma.category.create({ data: cat });
    categories[cat.slug] = c.id;
    console.log(`  ✅ Category: ${cat.name}`);
  }

  const PRODUCTS = [
    // Design-flow products — every design at /custom/[design] is ordered as its line's
    // product; designs, sizes and prices live in src/lib/designs/
    {
      name: "Customised Acrylic Photo Wall Clock", slug: "customised-wall-clock",
      description: "A working acrylic wall clock built around your photos, in the design and size you choose.",
      basePrice: 999, comparePrice: 1499, imageUrl: img("customised-wall-clock"), images: JSON.stringify([img("customised-wall-clock")]),
      categorySlug: "wall-clocks", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["wall-clocks", "popular"]),
      variants: [],
    },
    {
      name: "Customised Acrylic Name Plate", slug: "customised-name-plate",
      description: "A designer acrylic name plate personalised with your family name and address.",
      basePrice: 799, comparePrice: 1299, imageUrl: img("customised-name-plate"), images: JSON.stringify([img("customised-name-plate")]),
      categorySlug: "name-plates", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["name-plates", "popular"]),
      variants: [],
    },
    {
      name: "Customised Acrylic Monogram Name Plate", slug: "customised-monogram-name-plate",
      description: "An acrylic monogram sign with your initial and family name.",
      basePrice: 799, comparePrice: 1499, imageUrl: img("customised-monogram-name-plate"), images: JSON.stringify([img("customised-monogram-name-plate")]),
      categorySlug: "name-plates", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["name-plates"]),
      variants: [],
    },
    {
      name: "Customised Acrylic Photo", slug: "customised-acrylic-photo",
      description: "Your photo printed on glossy acrylic, in the design, size and thickness you choose.",
      basePrice: 699, comparePrice: 1299, imageUrl: img("customised-acrylic-photo"), images: JSON.stringify([img("customised-acrylic-photo")]),
      categorySlug: "acrylic-photos", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["acrylic-photos", "popular"]),
      variants: [],
    },
    {
      name: "Portrait Acrylic Photo Print", slug: "portrait-acrylic-photo-print",
      description: "Your favourite portrait photo printed on vivid, museum-quality acrylic. Ready to hang, with a glossy finish that makes colours pop.",
      basePrice: 399, comparePrice: 599, imageUrl: img("portrait-acrylic-photo-print"), images: JSON.stringify([img("portrait-acrylic-photo-print")]),
      categorySlug: "acrylic-photos", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["acrylic-photos", "popular"]),
      variants: [
        { name: "Size", options: opts(["8×10 in", "12×16 in", "16×20 in"]), priceAdj: 0 },
      ],
    },
    {
      name: "Circle Acrylic Photo Print", slug: "circle-acrylic-photo-print",
      description: "A circular acrylic photo print with a modern, minimal look — a fresh alternative to traditional rectangular frames.",
      basePrice: 449, comparePrice: 649, imageUrl: img("circle-acrylic-photo-print"), images: JSON.stringify([img("circle-acrylic-photo-print")]),
      categorySlug: "acrylic-photos", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["acrylic-photos"]),
      variants: [
        { name: "Size", options: opts(["8 in diameter", "12 in diameter"]), priceAdj: 0 },
      ],
    },
    // Wall Clocks
    {
      name: "Square Round Acrylic Photo Wall Clock", slug: "square-round-acrylic-wall-clock",
      description: "A working wall clock built around your photo, printed on durable acrylic with a smooth square-round silhouette.",
      basePrice: 599, comparePrice: 899, imageUrl: img("square-round-acrylic-wall-clock"), images: JSON.stringify([img("square-round-acrylic-wall-clock")]),
      categorySlug: "wall-clocks", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["wall-clocks", "popular"]),
      variants: [
        { name: "Size", options: opts(["10 in", "12 in"]), priceAdj: 0 },
      ],
    },
    {
      name: "Heart Shape Acrylic Photo Wall Clock", slug: "heart-acrylic-wall-clock",
      description: "A heart-shaped acrylic wall clock featuring your photo — a sweet, functional gift for anniversaries and Valentine's Day.",
      basePrice: 649, comparePrice: 949, imageUrl: img("heart-acrylic-wall-clock"), images: JSON.stringify([img("heart-acrylic-wall-clock")]),
      categorySlug: "wall-clocks", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["wall-clocks"]),
      variants: [],
    },
    // Name Plates
    {
      name: "Ganesha Acrylic Designer Name Plate", slug: "ganesha-acrylic-name-plate",
      description: "An elegant laser-cut acrylic name plate featuring a Ganesha motif, personalised with your family name.",
      basePrice: 699, comparePrice: 999, imageUrl: img("ganesha-acrylic-name-plate"), images: JSON.stringify([img("ganesha-acrylic-name-plate")]),
      categorySlug: "name-plates", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["name-plates", "popular"]),
      variants: [
        { name: "Color", options: opts(["Clear", "Gold", "Rose Gold", "Black"]), priceAdj: 0 },
        { name: "Size", options: opts(["Small", "Medium", "Large"]), priceAdj: 0 },
      ],
    },
    {
      name: "Marble Design Acrylic Name Plate", slug: "marble-acrylic-name-plate",
      description: "A sophisticated marble-textured acrylic name plate for a premium look at your entrance or office desk.",
      basePrice: 749, comparePrice: 1049, imageUrl: img("marble-acrylic-name-plate"), images: JSON.stringify([img("marble-acrylic-name-plate")]),
      categorySlug: "name-plates", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["name-plates"]),
      variants: [
        { name: "Size", options: opts(["Small", "Medium", "Large"]), priceAdj: 0 },
      ],
    },
    {
      name: "Owl Design Acrylic Monogram Name Plate", slug: "owl-monogram-name-plate",
      description: "A playful owl-themed monogram name plate — personalise it with your initials or family name.",
      basePrice: 679, comparePrice: 949, imageUrl: img("owl-monogram-name-plate"), images: JSON.stringify([img("owl-monogram-name-plate")]),
      categorySlug: "name-plates", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["name-plates"]),
      variants: [],
    },
    // Fridge Magnets
    {
      name: "Acrylic Photo Fridge Magnet — Square", slug: "square-acrylic-fridge-magnet",
      description: "A crisp square acrylic fridge magnet printed with your photo, held firmly with a strong neodymium magnet.",
      basePrice: 249, comparePrice: 349, imageUrl: img("square-acrylic-fridge-magnet"), images: JSON.stringify([img("square-acrylic-fridge-magnet")]),
      categorySlug: "fridge-magnets", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["fridge-magnets", "popular"]),
      variants: [
        { name: "Size", options: opts(["2×2 in", "3×3 in", "4×4 in"]), priceAdj: 0 },
      ],
    },
    {
      name: "Acrylic Photo Fridge Magnet — Heart", slug: "heart-acrylic-fridge-magnet",
      description: "A heart-shaped acrylic fridge magnet, personalised with your favourite photo — a sweet everyday keepsake.",
      basePrice: 269, comparePrice: 379, imageUrl: img("heart-acrylic-fridge-magnet"), images: JSON.stringify([img("heart-acrylic-fridge-magnet")]),
      categorySlug: "fridge-magnets", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["fridge-magnets"]),
      variants: [],
    },
    // Framed Acrylic Photos
    {
      name: "Aluminium Framed Acrylic Photo — Portrait", slug: "aluminium-framed-acrylic-photo",
      description: "Your portrait photo on acrylic, finished with a sleek aluminium frame — ready to hang straight out of the box.",
      basePrice: 899, comparePrice: 1299, imageUrl: img("aluminium-framed-acrylic-photo"), images: JSON.stringify([img("aluminium-framed-acrylic-photo")]),
      categorySlug: "framed-photos", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["framed-photos", "popular"]),
      variants: [
        { name: "Size", options: opts(["A4", "A3"]), priceAdj: 0 },
        { name: "Frame Color", options: opts(["Silver", "Black", "Gold"]), priceAdj: 0 },
      ],
    },
    // Keychains
    {
      name: "4 Photos with 2 Keychains — Square & Round Set", slug: "square-round-photo-keychain-set",
      description: "A set of two acrylic keychains — one square, one round — each holding two of your favourite photos.",
      basePrice: 299, comparePrice: 399, imageUrl: img("square-round-photo-keychain-set"), images: JSON.stringify([img("square-round-photo-keychain-set")]),
      categorySlug: "keychains", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["keychains", "popular"]),
      variants: [],
    },
    {
      name: "2 Keychains Heart Shape — 4 Photos", slug: "heart-photo-keychain-set",
      description: "A pair of heart-shaped acrylic keychains featuring four of your photos — perfect for couples and best friends.",
      basePrice: 319, comparePrice: 419, imageUrl: img("heart-photo-keychain-set"), images: JSON.stringify([img("heart-photo-keychain-set")]),
      categorySlug: "keychains", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["keychains"]),
      variants: [],
    },
    // Luggage Tags
    {
      name: "House Shape Luggage Tag — 2 Photos", slug: "house-shape-luggage-tag",
      description: "A sturdy acrylic luggage tag in a house silhouette, personalised with two photos and your travel details.",
      basePrice: 279, comparePrice: 399, imageUrl: img("house-shape-luggage-tag"), images: JSON.stringify([img("house-shape-luggage-tag")]),
      categorySlug: "luggage-tags", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["luggage-tags"]),
      variants: [],
    },
    {
      name: "Rounded Rectangle Luggage Tag — 2 Photos", slug: "rounded-rectangle-luggage-tag",
      description: "A classic rounded-rectangle acrylic luggage tag, personalised with two photos — easy to spot on the carousel.",
      basePrice: 269, comparePrice: 379, imageUrl: img("rounded-rectangle-luggage-tag"), images: JSON.stringify([img("rounded-rectangle-luggage-tag")]),
      categorySlug: "luggage-tags", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["luggage-tags"]),
      variants: [],
    },
    // Mini Photo Gallery
    {
      name: "Acrylic Photo Mini Wall Gallery — Set of 6", slug: "acrylic-mini-wall-gallery-set-of-6",
      description: "Six small acrylic photo pieces arranged as a gallery wall — a striking way to display a set of memories together.",
      basePrice: 799, comparePrice: 1199, imageUrl: img("acrylic-mini-wall-gallery-set-of-6"), images: JSON.stringify([img("acrylic-mini-wall-gallery-set-of-6")]),
      categorySlug: "mini-wall-gallery", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["mini-wall-gallery", "popular"]),
      variants: [
        { name: "Set Size", options: opts(["4-piece set", "6-piece set"]), priceAdj: 0 },
      ],
    },
    // Photo Stands
    {
      name: "Acrylic Photo Stand — Desk Frame", slug: "acrylic-photo-stand-desk-frame",
      description: "A free-standing acrylic photo piece for your desk or shelf — no wall-mounting hardware needed.",
      basePrice: 349, comparePrice: 499, imageUrl: img("acrylic-photo-stand-desk-frame"), images: JSON.stringify([img("acrylic-photo-stand-desk-frame")]),
      categorySlug: "photo-stands", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["photo-stands"]),
      variants: [
        { name: "Size", options: opts(["Small", "Medium"]), priceAdj: 0 },
      ],
    },
    // Photo Albums
    {
      name: "\"Miles of Memories\" Travel Photobook", slug: "miles-of-memories-travel-photobook",
      description: "A beautifully laid-out travel photobook to relive your trips, page by page — a keepsake for every wanderer.",
      basePrice: 899, comparePrice: 1299, imageUrl: img("miles-of-memories-travel-photobook"), images: JSON.stringify([img("miles-of-memories-travel-photobook")]),
      categorySlug: "photo-albums", isCustomizable: true, isFeatured: true, tags: JSON.stringify(["photo-albums", "popular"]),
      variants: [
        { name: "Pages", options: opts(["20 pages", "40 pages"]), priceAdj: 0 },
      ],
    },
    {
      name: "\"Tiny Toes, Big Love\" Baby Photo Album", slug: "tiny-toes-big-love-baby-album",
      description: "A tender baby photo album to capture every tiny milestone — from first smiles to first steps.",
      basePrice: 849, comparePrice: 1199, imageUrl: img("tiny-toes-big-love-baby-album"), images: JSON.stringify([img("tiny-toes-big-love-baby-album")]),
      categorySlug: "photo-albums", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["photo-albums"]),
      variants: [
        { name: "Pages", options: opts(["20 pages", "40 pages"]), priceAdj: 0 },
      ],
    },
    {
      name: "Anniversary Photo Album — He & She", slug: "he-and-she-anniversary-album",
      description: "A romantic anniversary photo album celebrating your journey together as a couple.",
      basePrice: 899, comparePrice: 1299, imageUrl: img("he-and-she-anniversary-album"), images: JSON.stringify([img("he-and-she-anniversary-album")]),
      categorySlug: "photo-albums", isCustomizable: true, isFeatured: false, tags: JSON.stringify(["photo-albums"]),
      variants: [],
    },
  ];

  for (const { categorySlug, variants, ...product } of PRODUCTS) {
    const p = await prisma.product.create({
      data: {
        ...product,
        categoryId: categories[categorySlug],
        variants: { create: variants },
      },
    });
    console.log(`  ✅ Product: ${p.name}`);
  }

  // Seed coupons
  await prisma.coupon.createMany({
    data: [
      { code: "MAA20", type: "percent", value: 20, minOrder: 0, maxUses: 1000, isActive: true },
      { code: "FIRST50", type: "flat", value: 50, minOrder: 299, maxUses: 500, isActive: true },
      { code: "FREESHIP", type: "flat", value: 59, minOrder: 199, isActive: true },
    ],
  });
  console.log("  ✅ Coupons seeded");

  console.log("\n🎉 Database seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

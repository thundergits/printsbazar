import type { Design, ProductLine } from "./types";

const FULL = [{ x: 0, y: 0, w: 1, h: 1 }];
const DUAL = { margin: 0.07, line: 0.006, lineColor: "#1c1917" };

const d = (design: Omit<Design, "line" | "slots">): Design => ({ ...design, line: "acrylic-print", slots: FULL });

const DESIGNS: Design[] = [
  d({ slug: "portrait-acrylic-wall-photo", name: "Portrait Acrylic Wall Photo", orientation: "portrait", shape: "rect", radius: 0, filters: ["portrait"] }),
  d({ slug: "landscape-acrylic-wall-photo", name: "Landscape Acrylic Wall Photo", orientation: "landscape", shape: "rect", radius: 0, filters: ["landscape"] }),
  d({ slug: "square-acrylic-wall-photo", name: "Acrylic Square Wall Photo", orientation: "square", shape: "rect", radius: 0, filters: ["square"] }),
  d({ slug: "portrait-dual-border-acrylic-wall-photo", name: "Portrait Acrylic Wall Photo Dual Border", orientation: "portrait", shape: "rect", radius: 0, dualBorder: DUAL, filters: ["portrait", "dual-border"] }),
  d({ slug: "rounded-rect-portrait-acrylic-wall-photo", name: "Rounded Rect Portrait Acrylic Wall Photo", orientation: "portrait", shape: "rect", radius: 0.07, filters: ["portrait", "rounded"] }),
  d({ slug: "landscape-dual-border-acrylic-wall-photo", name: "Landscape Acrylic Wall Photo Dual Border", orientation: "landscape", shape: "rect", radius: 0, dualBorder: DUAL, filters: ["landscape", "dual-border"] }),
  d({ slug: "rounded-rect-landscape-acrylic-wall-photo", name: "Rounded Rect Landscape Acrylic Wall Photo", orientation: "landscape", shape: "rect", radius: 0.07, filters: ["landscape", "rounded"] }),
  d({ slug: "square-round-acrylic-wall-photo", name: "Square Round Acrylic Wall Photo", orientation: "square", shape: "rect", radius: 0.14, filters: ["square", "rounded"] }),
  d({ slug: "circle-acrylic-wall-photo", name: "Circle Acrylic Wall Photo", orientation: "square", shape: "circle", radius: 0, filters: ["square", "creative"] }),
  d({ slug: "square-dual-border-acrylic-wall-photo", name: "Acrylic Square Wall Photo Dual Border", orientation: "square", shape: "rect", radius: 0, dualBorder: DUAL, filters: ["square", "dual-border"] }),
  d({ slug: "square-round-dual-border-acrylic-wall-photo", name: "Dual Border Square Round Acrylic Wall Photo", orientation: "square", shape: "rect", radius: 0.14, dualBorder: DUAL, filters: ["square", "rounded", "dual-border"] }),
  d({ slug: "extra-rounded-portrait-acrylic-wall-photo", name: "Extra Rounded Portrait Acrylic Wall Photo", orientation: "portrait", shape: "rect", radius: 0.22, filters: ["portrait", "rounded", "creative"] }),
  d({ slug: "heart-acrylic-wall-photo", name: "Heart Acrylic Wall Photo", orientation: "square", shape: "heart", radius: 0, filters: ["square", "creative"] }),
];

// Prices are a starting point — edit to your own rate card.
export const ACRYLIC_PRINT: ProductLine = {
  id: "acrylic-print",
  title: "Acrylic Wall Photos",
  itemName: "Acrylic Wall Photo",
  intro: "Select a photo to preview it on every design, then pick your favourite.",
  productSlug: "customised-acrylic-photo",
  categorySlug: "acrylic-photos",
  filters: [
    { id: "all", label: "All" },
    { id: "portrait", label: "Portrait" },
    { id: "landscape", label: "Landscape" },
    { id: "square", label: "Square" },
    { id: "rounded", label: "Rounded" },
    { id: "dual-border", label: "Dual Border" },
    { id: "creative", label: "Creative" },
  ],
  designs: DESIGNS,
  sizes: {
    rect: [
      { id: "12x9", long: 12, short: 9, prices: { "3mm": { price: 699, mrp: 1299 }, "5mm": { price: 899, mrp: 1499 }, "8mm": { price: 1399, mrp: 2999 } } },
      { id: "16x12", long: 16, short: 12, prices: { "3mm": { price: 1099, mrp: 1799 }, "5mm": { price: 1799, mrp: 2799 }, "8mm": { price: 2399, mrp: 3499 } } },
      { id: "18x12", long: 18, short: 12, prices: { "3mm": { price: 1499, mrp: 2599 }, "5mm": { price: 1999, mrp: 2999 }, "8mm": { price: 2799, mrp: 4999 } } },
      { id: "21x15", long: 21, short: 15, prices: { "3mm": { price: 1999, mrp: 2999 }, "5mm": { price: 2799, mrp: 3999 }, "8mm": { price: 3999, mrp: 4999 } } },
      { id: "30x20", long: 30, short: 20, prices: { "3mm": { price: 3499, mrp: 5999 }, "5mm": { price: 4499, mrp: 6999 }, "8mm": { price: 5999, mrp: 7999 } } },
      { id: "35x23", long: 35, short: 23, prices: { "3mm": { price: 4499, mrp: 9999 }, "5mm": { price: 5499, mrp: 12999 }, "8mm": { price: 7999, mrp: 14999 } } },
      { id: "48x36", long: 48, short: 36, prices: { "8mm": { price: 24999, mrp: 39999 } } },
    ],
    square: [
      { id: "8x8", long: 8, short: 8, prices: { "3mm": { price: 599, mrp: 999 }, "5mm": { price: 799, mrp: 1299 } } },
      { id: "11x11", long: 11, short: 11, prices: { "3mm": { price: 899, mrp: 1499 }, "5mm": { price: 1199, mrp: 1999 }, "8mm": { price: 1699, mrp: 2999 } } },
      { id: "16x16", long: 16, short: 16, prices: { "3mm": { price: 1499, mrp: 2499 }, "5mm": { price: 2199, mrp: 3299 }, "8mm": { price: 2999, mrp: 4499 } } },
      { id: "24x24", long: 24, short: 24, prices: { "5mm": { price: 3999, mrp: 5999 }, "8mm": { price: 4999, mrp: 7999 } } },
    ],
  },
  mounting: (size, thickness) =>
    thickness !== "3mm" && size.long >= 15 && size.short >= 12
      ? { kind: "studs", text: "Steel stud mounting — 4 studs drilled ~1 inch from the edges. Wall-plugs & screws included." }
      : { kind: "hooks", text: "Adhesive hooks + transparent double-sided tape included. No drilling needed." },
  description:
    "Turn your favourite photo into a glossy acrylic wall piece. Your photo is printed in HD on clear acrylic, giving deep colours and a glass-like finish that brightens any wall.",
  highlights: [
    "Available in 3mm, 5mm and 8mm thickness",
    "Polished edges and a ready-to-hang mounting kit",
    "Auto-orientation — sizes follow your design (portrait, landscape or square)",
    "Each piece is checked before it is packed and shipped",
  ],
  howTo: [
    ["Upload", "Upload a bright, clear, high-resolution photo."],
    ["Adjust", "Drag and zoom to place the photo inside the frame."],
    ["Choose size", "Pick a size and thickness, and preview it in 3D."],
    ["Order", "Pay securely — we make, pack and ship it to you."],
  ],
  faqs: [
    { q: "How does it mount?", a: "Smaller and 3mm prints come with adhesive hooks and transparent double-sided tape — just peel and press onto a clean, smooth wall. Larger 5mm and 8mm prints use steel studs fixed about 1 inch from the edges, and the screws and wall-plugs are included." },
    { q: "Which sizes get hooks and which get studs?", a: "5mm and 8mm prints of 15×12 inches and above are mounted with steel studs. Everything else uses adhesive hooks." },
    { q: "What kind of photo works best?", a: "Use the original photo from your camera or gallery. Screenshots and images saved from WhatsApp or social media are compressed and can print blurry. We'll show you a quality indicator for each size." },
    { q: "Is my photo uploaded while I'm previewing?", a: "No. All previews are created in your browser. Your photo is uploaded only when you add the design to your cart." },
    { q: "How long does delivery take?", a: "Each piece is made to order in 1–3 working days and then shipped. Enter your pincode to see the expected delivery date." },
  ],
};

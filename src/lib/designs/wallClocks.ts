import type { Design, PhotoSlot, ProductLine } from "./types";

const FULL: PhotoSlot[] = [{ x: 0, y: 0, w: 1, h: 1 }];
const GAP = 0.015;
const HALVES: PhotoSlot[] = [
  { x: 0, y: 0, w: 0.5 - GAP / 2, h: 1 },
  { x: 0.5 + GAP / 2, y: 0, w: 0.5 - GAP / 2, h: 1 },
];
const GRID_4: PhotoSlot[] = [
  { x: 0, y: 0, w: 0.5 - GAP / 2, h: 0.5 - GAP / 2 },
  { x: 0.5 + GAP / 2, y: 0, w: 0.5 - GAP / 2, h: 0.5 - GAP / 2 },
  { x: 0, y: 0.5 + GAP / 2, w: 0.5 - GAP / 2, h: 0.5 - GAP / 2 },
  { x: 0.5 + GAP / 2, y: 0.5 + GAP / 2, w: 0.5 - GAP / 2, h: 0.5 - GAP / 2 },
];
const FEATURE_3: PhotoSlot[] = [
  { x: 0, y: 0, w: 0.6, h: 1 },
  { x: 0.6 + GAP, y: 0, w: 0.4 - GAP, h: 0.5 - GAP / 2 },
  { x: 0.6 + GAP, y: 0.5 + GAP / 2, w: 0.4 - GAP, h: 0.5 - GAP / 2 },
];
const LEAF: [number, number, number, number] = [0.5, 0.04, 0.5, 0.04];

const d = (design: Omit<Design, "line" | "orientation">): Design => ({ ...design, line: "wall-clocks", orientation: "square" });

const DESIGNS: Design[] = [
  d({ slug: "circle-acrylic-photo-wall-clock", name: "Circle Acrylic Photo Wall Clock", shape: "circle", radius: 0, slots: FULL, clock: { face: "numbers", color: "#ffffff" }, filters: ["circle"] }),
  d({ slug: "square-round-acrylic-photo-wall-clock", name: "Square Round Acrylic Photo Wall Clock", shape: "rect", radius: 0.14, slots: FULL, clock: { face: "numbers", color: "#ffffff" }, filters: ["square"] }),
  d({ slug: "heart-shape-acrylic-wall-clock", name: "Heart Shape Acrylic Wall Clock", shape: "heart", radius: 0, slots: FULL, clock: { face: "bold", color: "#ffffff" }, filters: ["shapes"] }),
  d({ slug: "2-photos-circle-acrylic-photo-wall-clock", name: "2 Photos Circle Acrylic Photo Wall Clock", shape: "circle", radius: 0, slots: HALVES, clock: { face: "ticks", color: "#ffffff" }, filters: ["circle", "collage"] }),
  d({ slug: "4-pics-acrylic-photo-clock", name: "4 Pics Acrylic Photo Clock", shape: "rect", radius: 0.06, slots: GRID_4, clock: { face: "bold", color: "#ffffff" }, filters: ["square", "collage"] }),
  d({ slug: "square-round-collage-acrylic-photo-wall-clock", name: "Square Round Collage Acrylic Photo Wall Clock", shape: "rect", radius: 0.14, slots: FEATURE_3, clock: { face: "ticks", color: "#ffffff" }, filters: ["square", "collage"] }),
  d({ slug: "hexagon-acrylic-photo-wall-clock", name: "Hexagon Acrylic Photo Wall Clock", shape: "hexagon", radius: 0, slots: FULL, clock: { face: "ticks", color: "#ffffff" }, filters: ["shapes"] }),
  d({ slug: "leaf-shape-acrylic-wall-clock", name: "Leaf Shape Acrylic Wall Clock", shape: "rect", radius: 0, corners: LEAF, slots: FULL, clock: { face: "roman", color: "#ffffff" }, filters: ["shapes"] }),
  d({ slug: "4-photo-leaf-shape-acrylic-wall-clock", name: "4 Photo Leaf Shape Acrylic Wall Clock", shape: "rect", radius: 0, corners: LEAF, slots: GRID_4, clock: { face: "bold", color: "#ffffff" }, filters: ["shapes", "collage"] }),
  d({ slug: "dual-border-roman-acrylic-wall-clock", name: "Dual Border Roman Acrylic Wall Clock", shape: "rect", radius: 0, dualBorder: { margin: 0.07, line: 0.006, lineColor: "#1c1917" }, slots: FULL, clock: { face: "roman", color: "#ffffff" }, filters: ["square"] }),
];

// Prices are a starting point — edit to your own rate card.
export const WALL_CLOCKS: ProductLine = {
  id: "wall-clocks",
  title: "Acrylic Photo Wall Clocks",
  itemName: "Wall Clock",
  intro: "Select a photo to preview it on every clock, then pick your favourite.",
  productSlug: "customised-wall-clock",
  categorySlug: "wall-clocks",
  filters: [
    { id: "all", label: "All" },
    { id: "circle", label: "Circle" },
    { id: "square", label: "Square" },
    { id: "collage", label: "Collage" },
    { id: "shapes", label: "Heart & Shapes" },
  ],
  designs: DESIGNS,
  sizes: {
    rect: [],
    square: [
      { id: "11x11", long: 11, short: 11, prices: { "3mm": { price: 999, mrp: 1499 } } },
      { id: "16x16", long: 16, short: 16, prices: { "3mm": { price: 1699, mrp: 2499 } } },
      { id: "20x20", long: 20, short: 20, prices: { "3mm": { price: 2499, mrp: 3499 } } },
    ],
  },
  mounting: () => ({
    kind: "clock",
    text: "Clock movement and hands come pre-fitted. Runs on 1 AA battery — hangs on a single nail or hook.",
  }),
  description:
    "A working wall clock built around your photos. Printed in HD on glossy acrylic, with a quiet clock movement fitted at the centre — just add a battery and hang it up.",
  highlights: [
    "Printed on 3mm glossy acrylic",
    "Choose your numbers style and colour",
    "Single photo and collage designs",
    "Clock movement and hands pre-fitted",
  ],
  howTo: [
    ["Upload", "Upload one photo, or one for each spot in a collage."],
    ["Adjust", "Drag and zoom each photo, and pick your numbers style."],
    ["Choose size", "Pick a size and preview your clock in 3D."],
    ["Order", "Pay securely — we make, pack and ship it to you."],
  ],
  faqs: [
    { q: "Does the clock come ready to use?", a: "Yes. The clock movement and hands are fitted before shipping. Insert 1 AA battery, set the time and hang it on a nail or hook." },
    { q: "Are the hands printed on the photo?", a: "No. The hands in the preview show how the finished clock looks — the real hands are fitted on top of the print, so your photo stays clear." },
    { q: "Can I use different photos in a collage clock?", a: "Yes. Collage designs have a spot for each photo — pick a photo for every spot, or use the same one throughout." },
    { q: "Is my photo uploaded while I'm previewing?", a: "No. All previews are created in your browser. Your photos are uploaded only when you add the clock to your cart." },
    { q: "How long does delivery take?", a: "Each clock is made to order in 1–3 working days and then shipped. Enter your pincode to see the expected delivery date." },
  ],
};

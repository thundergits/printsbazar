import type { Design, DesignSize, FontId, ProductLine, TextLayer, ThemeId } from "./types";

const NAME = (y: number, font: TextLayer["font"] = "primary", color?: string): TextLayer => ({
  id: "name", label: "Name", default: "The Sharmas", maxLength: 24, x: 0.5, y, maxWidth: 0.82, size: 0.26, weight: 700, font, color,
});
const ADDRESS = (y: number, color?: string): TextLayer => ({
  id: "line2", label: "House no. / Address", default: "House No. 21, Shanti Nagar", maxLength: 40, x: 0.5, y, maxWidth: 0.78, size: 0.085, weight: 500, font: "poppins", color,
});
const OM = (x: number, y: number, size: number): TextLayer => ({
  id: "om", label: "Om", default: "ॐ", maxLength: 1, x, y, maxWidth: 0.4, size, weight: 700, font: "devanagari", color: "#b45309", fixed: true,
});
const GOLD = "#a8841c";

const plate = (slug: string, name: string, theme: ThemeId, font: FontId, filters: string[], extra: Partial<Design> = {}): Design => ({
  slug, name, theme, font, filters,
  line: "acrylic-name-plate",
  orientation: "landscape",
  shape: "rect",
  radius: 0.05,
  texts: [NAME(0.45), ADDRESS(0.73)],
  ...extra,
});

const DESIGNS: Design[] = [
  plate("classic-amber-name-plate", "Classic Amber Name Plate", "amber", "playfair", ["classic"], {
    frameLines: [{ inset: 0.045, width: 0.006, color: "#7c2d12" }],
    texts: [NAME(0.45, "primary", "#451a03"), ADDRESS(0.73, "#7c2d12")],
  }),
  plate("marble-design-acrylic-name-plate", "Marble Design Acrylic Name Plate", "marble", "cinzel", ["classic", "modern"], {
    frameLines: [{ inset: 0.045, width: 0.008, color: GOLD }],
  }),
  plate("midnight-glass-acrylic-name-plate", "Midnight Glass Acrylic Name Plate", "midnight", "great-vibes", ["modern"], {
    radius: 0.08,
  }),
  plate("rose-bloom-acrylic-name-plate", "Rose Bloom Acrylic Name Plate", "rose", "dancing", ["floral"], {
    texts: [NAME(0.45, "primary", "#831843"), ADDRESS(0.73, "#9d174d")],
  }),
  plate("sunset-vista-name-plate", "Sunset Vista Name Plate", "sunset", "playfair", ["modern"], {
    texts: [NAME(0.38), ADDRESS(0.6)],
  }),
  plate("wooden-classic-acrylic-name-plate", "Wooden Classic Acrylic Name Plate", "wood", "cinzel", ["classic"], {
    radius: 0.03,
    frameLines: [{ inset: 0.04, width: 0.006, color: "#fde68a" }],
  }),
  plate("divine-om-acrylic-name-plate", "Divine Om Acrylic Name Plate", "ivory", "playfair", ["divine"], {
    frameLines: [{ inset: 0.04, width: 0.008, color: GOLD }, { inset: 0.06, width: 0.003, color: GOLD }],
    texts: [OM(0.19, 0.5, 0.42), { ...NAME(0.44), x: 0.62, maxWidth: 0.54, size: 0.2 }, { ...ADDRESS(0.68), x: 0.62, maxWidth: 0.54 }],
  }),
  plate("divine-om-portrait-acrylic-name-plate", "Divine Om Portrait Acrylic Name Plate", "ivory", "playfair", ["divine"], {
    orientation: "portrait",
    frameLines: [{ inset: 0.05, width: 0.012, color: GOLD }, { inset: 0.08, width: 0.004, color: GOLD }],
    texts: [OM(0.5, 0.3, 0.42), { ...NAME(0.6), size: 0.17, maxWidth: 0.78 }, { ...ADDRESS(0.75), size: 0.07, maxWidth: 0.74 }],
  }),
  plate("divine-om-square-acrylic-name-plate", "Divine Om Square Acrylic Name Plate", "ivory", "playfair", ["divine"], {
    orientation: "square",
    frameLines: [{ inset: 0.045, width: 0.01, color: GOLD }, { inset: 0.07, width: 0.004, color: GOLD }],
    texts: [OM(0.5, 0.32, 0.36), { ...NAME(0.63), size: 0.15, maxWidth: 0.78 }, { ...ADDRESS(0.79), size: 0.06, maxWidth: 0.74 }],
  }),
];

const RECT_SIZES: DesignSize[] = [
  { id: "12x8", long: 12, short: 8, prices: { "3mm": { price: 799, mrp: 1299 }, "8mm": { price: 999, mrp: 1499 } } },
  { id: "18x12", long: 18, short: 12, prices: { "3mm": { price: 1699, mrp: 1799 }, "8mm": { price: 2499, mrp: 2999 } } },
];
const SQUARE_SIZES: DesignSize[] = [
  { id: "11x11", long: 11, short: 11, prices: { "3mm": { price: 799, mrp: 1499 }, "8mm": { price: 1499, mrp: 1999 } } },
  { id: "16x16", long: 16, short: 16, prices: { "3mm": { price: 1699, mrp: 2499 }, "8mm": { price: 2499, mrp: 3999 } } },
];

const plateMounting: ProductLine["mounting"] = (_size, thickness) =>
  thickness === "8mm"
    ? { kind: "studs", text: "Steel stud mounting — studs, screws and wall-plugs included." }
    : { kind: "tape", text: "Strong double-sided mounting tape included — sticks to a clean, smooth wall or door." };

const TEXT_FAQS = [
  { q: "Can I change the font and wording?", a: "Yes. Type your family name and address in the editor and choose a font — the preview updates as you type." },
  { q: "Is it suitable for outdoor use?", a: "Acrylic is weather-resistant, so it works at an entrance or gate. For a spot in direct, harsh sun all day, a shaded wall will keep the colours fresh for longer." },
  { q: "How does it mount?", a: "8mm name plates come with steel studs, screws and wall-plugs. 3mm name plates come with strong double-sided tape." },
  { q: "How long does delivery take?", a: "Each name plate is made to order in 1–3 working days and then shipped. Enter your pincode to see the expected delivery date." },
];

// Prices are a starting point — edit to your own rate card.
export const NAME_PLATES: ProductLine = {
  id: "acrylic-name-plate",
  title: "Acrylic Name Plates",
  itemName: "Acrylic Name Plate",
  intro: "Pick a design, add your family name, and preview it before you order.",
  productSlug: "customised-name-plate",
  categorySlug: "name-plates",
  filters: [
    { id: "all", label: "All" },
    { id: "classic", label: "Classic" },
    { id: "divine", label: "Divine" },
    { id: "modern", label: "Modern" },
    { id: "floral", label: "Floral" },
  ],
  designs: DESIGNS,
  sizes: { rect: RECT_SIZES, square: SQUARE_SIZES },
  mounting: plateMounting,
  description:
    "A designer acrylic name plate for your home or office entrance, personalised with your family name and address. Printed in HD on glossy acrylic for a clean, premium look.",
  highlights: [
    "Available in 3mm and 8mm thickness",
    "Choose your font and wording",
    "Weather-resistant acrylic for entrances",
    "Mounting kit included",
  ],
  howTo: [
    ["Pick a design", "Choose the style that suits your entrance."],
    ["Personalise", "Type your family name and address, and pick a font."],
    ["Choose size", "Pick a size and thickness, and preview it in 3D."],
    ["Order", "Pay securely — we make, pack and ship it to you."],
  ],
  faqs: TEXT_FAQS,
};

// ── Monogram name plates ─────────────────────────────────────────────────────

const LETTER = (y: number, color?: string): TextLayer => ({
  id: "letter", label: "Monogram letter", default: "S", maxLength: 1, x: 0.5, y, maxWidth: 0.6, size: 0.48, weight: 700, font: "primary", color, uppercase: true,
});
const MONO_NAME = (y: number, color?: string): TextLayer => ({
  id: "name", label: "Name", default: "The Sharmas", maxLength: 22, x: 0.5, y, maxWidth: 0.62, size: 0.08, weight: 600, font: "poppins", color, uppercase: true,
});

const mono = (slug: string, name: string, extra: Omit<Design, "slug" | "name" | "line" | "orientation" | "filters" | "radius"> & Partial<Design>): Design => ({
  slug, name, line: "acrylic-monogram-nameplate", orientation: "square", radius: 0, filters: [], ...extra,
});

const MONOGRAMS: Design[] = [
  mono("acrylic-monogram-round-name-plate", "Acrylic Monogram Round Name Plate", {
    shape: "circle", theme: "black-gold", font: "cinzel", filters: ["round"],
    frameLines: [{ inset: 0.035, width: 0.01, color: "#d4af37" }, { inset: 0.065, width: 0.004, color: "#d4af37" }],
    texts: [LETTER(0.45), MONO_NAME(0.77)],
  }),
  mono("acrylic-regal-monogram-name-plate", "Acrylic Regal Monogram Name Plate", {
    shape: "rect", theme: "ivory", font: "playfair", filters: ["square"],
    frameLines: [{ inset: 0.04, width: 0.012, color: "#1c1917" }, { inset: 0.07, width: 0.004, color: "#1c1917" }],
    texts: [LETTER(0.44, "#1c1917"), MONO_NAME(0.78, "#1c1917")],
  }),
  mono("acrylic-script-monogram-name-plate", "Acrylic Script Monogram Name Plate", {
    shape: "circle", theme: "ivory", font: "great-vibes", filters: ["round"],
    frameLines: [{ inset: 0.03, width: 0.014, color: "#1c1917" }],
    texts: [{ ...LETTER(0.46, "#1c1917"), size: 0.56 }, MONO_NAME(0.79, "#1c1917")],
  }),
  mono("acrylic-midnight-monogram-name-plate", "Acrylic Midnight Monogram Name Plate", {
    shape: "rect", radius: 0.14, theme: "midnight", font: "cinzel", filters: ["square"],
    frameLines: [{ inset: 0.05, width: 0.006, color: "#e2e8f0" }],
    texts: [LETTER(0.45), MONO_NAME(0.78)],
  }),
];

export const MONOGRAM_NAME_PLATES: ProductLine = {
  ...NAME_PLATES,
  id: "acrylic-monogram-nameplate",
  title: "Acrylic Monogram Name Plates",
  itemName: "Monogram Name Plate",
  intro: "Pick a monogram design, add your initial and name, and preview it before you order.",
  productSlug: "customised-monogram-name-plate",
  // Shares the name-plates category; product pages there redirect to the name plate gallery
  categorySlug: "",
  filters: [
    { id: "all", label: "All" },
    { id: "round", label: "Round" },
    { id: "square", label: "Square" },
  ],
  designs: MONOGRAMS,
  sizes: {
    rect: [],
    square: [
      { id: "11x11", long: 11, short: 11, prices: { "3mm": { price: 799, mrp: 1499 }, "8mm": { price: 1499, mrp: 1999 } } },
      { id: "16x16", long: 16, short: 16, prices: { "3mm": { price: 1699, mrp: 2499 }, "8mm": { price: 2499, mrp: 3999 } } },
      { id: "20x20", long: 20, short: 20, prices: { "3mm": { price: 4999, mrp: 7999 }, "8mm": { price: 6999, mrp: 8999 } } },
    ],
  },
  description:
    "A bold monogram sign for your door, living room or office — your initial in large lettering with your family name beneath, printed in HD on glossy acrylic.",
  howTo: [
    ["Pick a design", "Choose a round or square monogram."],
    ["Personalise", "Enter your initial and name, and pick a font."],
    ["Choose size", "Pick a size and thickness, and preview it in 3D."],
    ["Order", "Pay securely — we make, pack and ship it to you."],
  ],
};

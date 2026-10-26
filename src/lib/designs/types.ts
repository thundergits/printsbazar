// Shared types for the design-led customise flows (/customise/[line] → /custom/[design]).

export type LineId = "acrylic-print" | "wall-clocks" | "acrylic-name-plate" | "acrylic-monogram-nameplate";
export type Orientation = "portrait" | "landscape" | "square";
export type DesignShape = "rect" | "circle" | "heart" | "hexagon";
export type Thickness = "3mm" | "5mm" | "8mm";
export type FontId = "playfair" | "poppins" | "cinzel" | "great-vibes" | "dancing" | "bebas" | "audiowide" | "devanagari";

export type ThemeId = "amber" | "marble" | "midnight" | "rose" | "sunset" | "wood" | "black-gold" | "ivory";

export type ClockFace = "numbers" | "bold" | "roman" | "ticks";

/** A photo area, as fractions (0–1) of the design's inner box */
export interface PhotoSlot {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A line of text, positioned by its centre as fractions of the whole design */
export interface TextLayer {
  id: string;
  label: string;
  default: string;
  maxLength: number;
  x: number;
  y: number;
  /** Max text width, as a fraction of design width — longer text is shrunk to fit */
  maxWidth: number;
  /** Font size as a fraction of the design's short side */
  size: number;
  weight?: number;
  /** "primary" layers use the customer's chosen font */
  font: "primary" | FontId;
  /** Defaults to the theme's text colour */
  color?: string;
  uppercase?: boolean;
  /** Fixed motif text (e.g. ॐ) that the customer can't edit */
  fixed?: boolean;
}

/** A decorative outline drawn inset from the design's edge */
export interface FrameLine {
  inset: number;
  width: number;
  color: string;
}

export interface Design {
  slug: string;
  line: LineId;
  name: string;
  orientation: Orientation;
  shape: DesignShape;
  /** Corner radius as a fraction of the short side (rect shapes) */
  radius: number;
  /** Per-corner radii [tl, tr, br, bl], overriding `radius` — e.g. the leaf clock */
  corners?: [number, number, number, number];
  /** White margin + thin inner rule, as fractions of the short side */
  dualBorder?: { margin: number; line: number; lineColor: string };
  /** Photo areas; omitted for text-only designs */
  slots?: PhotoSlot[];
  /** Background for text designs */
  theme?: ThemeId;
  frameLines?: FrameLine[];
  texts?: TextLayer[];
  /** Default font for "primary" text layers */
  font?: FontId;
  clock?: { face: ClockFace; color: string };
  filters: string[];
}

export interface Price {
  price: number;
  mrp: number;
}

export interface DesignSize {
  id: string;
  /** Long side × short side, in inches */
  long: number;
  short: number;
  prices: Partial<Record<Thickness, Price>>;
}

export interface Mounting {
  kind: "studs" | "hooks" | "clock" | "tape";
  text: string;
}

export interface ProductLine {
  id: LineId;
  title: string;
  /** Singular, for breadcrumbs */
  itemName: string;
  intro: string;
  /** Catalogue product every design in this line is ordered as */
  productSlug: string;
  /** Shop category whose product pages redirect into this flow */
  categorySlug: string;
  filters: { id: string; label: string }[];
  designs: Design[];
  sizes: { rect: DesignSize[]; square: DesignSize[] };
  mounting: (size: DesignSize, thickness: Thickness) => Mounting;
  description: string;
  highlights: string[];
  howTo: [string, string][];
  faqs: { q: string; a: string }[];
}

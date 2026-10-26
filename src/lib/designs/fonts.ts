import {
  Audiowide, Bebas_Neue, Cinzel, Dancing_Script, Great_Vibes, Noto_Serif_Devanagari, Playfair_Display, Poppins,
} from "next/font/google";
import type { FontId } from "./types";

// Fonts the canvas draws with. next/font self-hosts them; the canvas then refers to
// the generated family names, so the font files must be loaded before drawing.
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"], display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600"], display: "swap" });
const cinzel = Cinzel({ subsets: ["latin"], weight: ["700"], display: "swap" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: ["400"], display: "swap" });
const dancing = Dancing_Script({ subsets: ["latin"], weight: ["700"], display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"], display: "swap" });
const audiowide = Audiowide({ subsets: ["latin"], weight: ["400"], display: "swap" });
const devanagari = Noto_Serif_Devanagari({ subsets: ["devanagari"], weight: ["700"], display: "swap" });

interface CanvasFont {
  label: string;
  family: string;
  weight: number;
  className: string;
}

export const FONTS: Record<FontId, CanvasFont> = {
  playfair: { label: "Elegant", family: playfair.style.fontFamily, weight: 700, className: playfair.className },
  poppins: { label: "Modern", family: poppins.style.fontFamily, weight: 600, className: poppins.className },
  cinzel: { label: "Regal", family: cinzel.style.fontFamily, weight: 700, className: cinzel.className },
  "great-vibes": { label: "Script", family: greatVibes.style.fontFamily, weight: 400, className: greatVibes.className },
  dancing: { label: "Handwritten", family: dancing.style.fontFamily, weight: 700, className: dancing.className },
  bebas: { label: "Bold", family: bebas.style.fontFamily, weight: 400, className: bebas.className },
  audiowide: { label: "Retro", family: audiowide.style.fontFamily, weight: 400, className: audiowide.className },
  devanagari: { label: "Devanagari", family: devanagari.style.fontFamily, weight: 700, className: devanagari.className },
};

/** Fonts a customer can pick for a design's main text */
export const PICKABLE_FONTS: FontId[] = ["playfair", "cinzel", "great-vibes", "dancing", "poppins", "bebas"];

let ready: Promise<void> | null = null;

/** Resolves once every canvas font has downloaded (safe to call repeatedly). */
export function loadCanvasFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  ready ??= Promise.all(
    Object.values(FONTS).map((f) => document.fonts.load(`${f.weight} 40px ${f.family}`, "Aaॐ").catch(() => []))
  ).then(() => undefined);
  return ready;
}

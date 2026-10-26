import { ACRYLIC_PRINT } from "./acrylicPrint";
import { WALL_CLOCKS } from "./wallClocks";
import { MONOGRAM_NAME_PLATES, NAME_PLATES } from "./namePlates";
import type { Design, DesignSize, LineId, PhotoSlot, Price, ProductLine, Thickness } from "./types";

export * from "./types";

export const THICKNESSES: Thickness[] = ["3mm", "5mm", "8mm"];

export const LINES: ProductLine[] = [ACRYLIC_PRINT, WALL_CLOCKS, NAME_PLATES, MONOGRAM_NAME_PLATES];

export function getLine(id: string): ProductLine | undefined {
  return LINES.find((l) => l.id === id);
}

/** Design slugs are unique across lines, so /custom/[design] needs no line in the URL */
export function getDesign(slug: string): Design | undefined {
  for (const line of LINES) {
    const design = line.designs.find((d) => d.slug === slug);
    if (design) return design;
  }
  return undefined;
}

export function lineOf(design: Design): ProductLine {
  return getLine(design.line)!;
}

export function lineForCategory(categorySlug: string): ProductLine | undefined {
  return LINES.find((l) => l.categorySlug && l.categorySlug === categorySlug);
}

export function sizesFor(design: Design): DesignSize[] {
  const { sizes } = lineOf(design);
  return design.orientation === "square" ? sizes.square : sizes.rect;
}

/** Width × height in inches, oriented to the design */
export function sizeDims(design: Design, size: DesignSize): { w: number; h: number } {
  return design.orientation === "portrait"
    ? { w: size.short, h: size.long }
    : { w: size.long, h: size.short };
}

/** Editor/gallery aspect (width / height): that of the design's first size */
export function designAspect(design: Design): number {
  const { w, h } = sizeDims(design, sizesFor(design)[0]);
  return w / h;
}

export function sizeLabel(design: Design, size: DesignSize): string {
  const { w, h } = sizeDims(design, size);
  return `${w}×${h}`;
}

export function getPrice(design: Design, sizeId: string, thickness: Thickness): Price | undefined {
  return sizesFor(design).find((s) => s.id === sizeId)?.prices[thickness];
}

/** Cheapest price for the design — the "From ₹…" figure in the gallery */
export function startingPrice(design: Design): number {
  return Math.min(...sizesFor(design).flatMap((s) => Object.values(s.prices).map((p) => p!.price)));
}

export function isTextOnly(design: Design): boolean {
  return !design.slots?.length;
}

/** Size of a photo slot in inches at the chosen print size */
export function slotInches(design: Design, slot: PhotoSlot, size: DesignSize): { w: number; h: number } {
  const { w, h } = sizeDims(design, size);
  const margin = design.dualBorder ? design.dualBorder.margin * Math.min(w, h) : 0;
  return { w: (w - margin * 2) * slot.w, h: (h - margin * 2) * slot.h };
}

export function printPpi(cropPx: { width: number; height: number }, inches: { w: number; h: number }): number {
  return Math.min(cropPx.width / inches.w, cropPx.height / inches.h);
}

export function qualityFor(ppi: number): { level: "great" | "ok" | "low"; text: string } {
  if (ppi >= 100) return { level: "great", text: "Great print quality at this size" };
  if (ppi >= 60) return { level: "ok", text: "Good quality — may look slightly soft up close" };
  return { level: "low", text: "Photo resolution is low for this size — choose a smaller size or a sharper photo" };
}

export function lineHref(id: LineId): string {
  return `/customise/${id}`;
}

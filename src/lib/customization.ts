import { getFrame } from "./frames";
import { getDesign } from "./designs";

export interface CustomPhoto {
  /** Full-resolution photo uploaded for printing */
  originalUrl: string;
  /** Crop of the original, in pixels, matching the print size */
  crop?: { x: number; y: number; width: number; height: number };
}

export interface ParsedCustomization {
  frameName?: string;
  note?: string;
  photos: CustomPhoto[];
  /** Customer-entered text, by label (name plates, monograms) */
  texts: { label: string; value: string }[];
  font?: string;
  clock?: { face: string; color: string };
  /** Print-ready artwork when it differs from the preview (e.g. clocks, without hands) */
  printUrl?: string;
}

/** Reads the `customization` field. Customizer items store JSON — either
 *  `{ frame, note }` from the product-page customizer or `{ design, size,
 *  thickness, photos, texts, font, clock, printUrl }` from the design flows —
 *  but older/plain values fall back to being treated as a freeform note. */
export function parseCustomization(raw?: string | null): ParsedCustomization {
  const empty: ParsedCustomization = { photos: [], texts: [] };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return empty;
    const design = parsed.design ? getDesign(parsed.design) : undefined;
    const photos: CustomPhoto[] = Array.isArray(parsed.photos)
      ? parsed.photos.filter((p: CustomPhoto) => p?.originalUrl)
      : parsed.originalUrl // single-photo acrylic items from before collage support
        ? [{ originalUrl: parsed.originalUrl, crop: parsed.crop }]
        : [];
    const texts = parsed.texts && typeof parsed.texts === "object"
      ? Object.entries(parsed.texts as Record<string, string>)
          .filter(([, value]) => value?.trim())
          .map(([id, value]) => ({ label: design?.texts?.find((t) => t.id === id)?.label ?? id, value }))
      : [];
    return {
      frameName: design ? design.name : parsed.frame ? getFrame(parsed.frame).name : undefined,
      note: parsed.note || undefined,
      photos,
      texts,
      font: parsed.font || undefined,
      clock: parsed.clock || undefined,
      printUrl: parsed.printUrl || undefined,
    };
  } catch {
    return { ...empty, note: raw };
  }
}

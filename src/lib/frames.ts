export type CropShape = "rect" | "round";

export interface FramePreset {
  id: string;
  name: string;
  aspect: number;
  cropShape: CropShape;
  /** Tailwind classes for the decorative border shown in the live preview (rect/round frames only) */
  previewBorderClassName?: string;
  /** Solid color used to draw the border/mask when baking the final image on canvas */
  borderColor: string;
  borderWidth: number;
  /** Extra bottom padding (polaroid-style caption strip), in px at the export resolution */
  bottomStrip?: number;
  /** Corner radius in px at export resolution, for rect-shaped frames */
  cornerRadius?: number;
  isHeart?: boolean;
}

// Normalized (0–1) polygon points tracing a simple heart silhouette, reused for
// both the CSS clip-path preview and the canvas Path2D used to bake the export.
export const HEART_POINTS: Array<[number, number]> = [
  [0.5, 0.15], [0.6, 0], [0.75, 0], [0.9, 0.15],
  [0.9, 0.35], [0.5, 0.8], [0.1, 0.35], [0.1, 0.15],
  [0.25, 0], [0.4, 0],
];

export function heartClipPath(scale = 1): string {
  return `polygon(${HEART_POINTS.map(([x, y]) => `${x * 100 * scale}% ${y * 100 * scale}%`).join(", ")})`;
}

export const FRAME_PRESETS: FramePreset[] = [
  {
    id: "classic",
    name: "Classic Gold",
    aspect: 1,
    cropShape: "rect",
    previewBorderClassName: "border-[10px] border-gold-400 rounded-md",
    borderColor: "#fbbf24",
    borderWidth: 22,
    cornerRadius: 8,
  },
  {
    id: "rounded",
    name: "Rounded Cream",
    aspect: 1,
    cropShape: "rect",
    previewBorderClassName: "border-[10px] border-cream-100 rounded-[2rem]",
    borderColor: "#fff7ed",
    borderWidth: 22,
    cornerRadius: 48,
  },
  {
    id: "circle",
    name: "Circle",
    aspect: 1,
    cropShape: "round",
    previewBorderClassName: "border-[10px] border-brand-400 rounded-full",
    borderColor: "#ff964d",
    borderWidth: 22,
  },
  {
    id: "polaroid",
    name: "Polaroid",
    aspect: 1,
    cropShape: "rect",
    previewBorderClassName: "border-[4px] border-b-[16px] border-white shadow-md",
    borderColor: "#ffffff",
    borderWidth: 22,
    bottomStrip: 90,
  },
  {
    id: "heart",
    name: "Heart",
    aspect: 1,
    cropShape: "rect",
    borderColor: "#e53e3e",
    borderWidth: 26,
    isHeart: true,
  },
];

export function getFrame(id: string): FramePreset {
  return FRAME_PRESETS.find((f) => f.id === id) ?? FRAME_PRESETS[0];
}

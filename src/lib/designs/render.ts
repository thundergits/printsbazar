import type { PixelCrop } from "@/lib/cropImage";
import { FONTS } from "./fonts";
import type { ClockFace, Design, FontId, ThemeId } from "./types";

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/** Largest centred crop of the image at the given aspect (width / height) */
export function coverCrop(imgW: number, imgH: number, aspect: number): PixelCrop {
  let width = imgW;
  let height = width / aspect;
  if (height > imgH) {
    height = imgH;
    width = height * aspect;
  }
  return { x: (imgW - width) / 2, y: (imgH - height) / 2, width, height };
}

/** Re-shapes a crop to a new aspect around the same centre, staying inside the image.
 *  Used when the chosen print size has a slightly different ratio than the editor frame. */
export function fitCropToAspect(crop: PixelCrop, aspect: number, imgW: number, imgH: number): PixelCrop {
  const cx = crop.x + crop.width / 2;
  const cy = crop.y + crop.height / 2;
  // Keep the same area so zoom level is preserved
  const area = crop.width * crop.height;
  let width = Math.sqrt(area * aspect);
  let height = width / aspect;
  if (width > imgW) {
    width = imgW;
    height = width / aspect;
  }
  if (height > imgH) {
    height = imgH;
    width = height * aspect;
  }
  const x = Math.min(Math.max(0, cx - width / 2), imgW - width);
  const y = Math.min(Math.max(0, cy - height / 2), imgH - height);
  return { x, y, width, height };
}

/** How a photo sits in its slot: zoom ≥ 1 over a cover fit, centred at (cx, cy) as fractions of the image */
export interface PanZoom {
  zoom: number;
  cx: number;
  cy: number;
}

export const DEFAULT_PAN: PanZoom = { zoom: 1, cx: 0.5, cy: 0.5 };
export const MAX_ZOOM = 4;

/** Pixel crop of the image for a slot of the given aspect, kept inside the image */
export function panCrop(imgW: number, imgH: number, aspect: number, pan: PanZoom = DEFAULT_PAN): PixelCrop {
  const base = coverCrop(imgW, imgH, aspect);
  const width = base.width / pan.zoom;
  const height = base.height / pan.zoom;
  const x = Math.min(Math.max(0, pan.cx * imgW - width / 2), imgW - width);
  const y = Math.min(Math.max(0, pan.cy * imgH - height / 2), imgH - height);
  return { x, y, width, height };
}

/** Normalises a pan so the stored centre matches what is actually visible */
export function clampPan(imgW: number, imgH: number, aspect: number, pan: PanZoom): PanZoom {
  const zoom = Math.min(MAX_ZOOM, Math.max(1, pan.zoom));
  const c = panCrop(imgW, imgH, aspect, { ...pan, zoom });
  return { zoom, cx: (c.x + c.width / 2) / imgW, cy: (c.y + c.height / 2) / imgH };
}

/** Where each photo slot sits on the design, as fractions of the design's width/height */
export function slotRects(design: Design, aspect: number) {
  const W = aspect * 1000, H = 1000;
  const box = innerBox(design, W, H);
  return (design.slots ?? []).map((s) => ({
    left: (box.x + s.x * box.w) / W,
    top: (box.y + s.y * box.h) / H,
    width: (s.w * box.w) / W,
    height: (s.h * box.h) / H,
  }));
}

// ── Shapes ──────────────────────────────────────────────────────────────────

export function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radii: number[]) {
  const max = Math.min(w, h) / 2;
  const [tl, tr, br, bl] = radii.map((r) => Math.max(0, Math.min(r, max)));
  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.arcTo(x + w, y, x + w, y + h, tr);
  ctx.arcTo(x + w, y + h, x, y + h, br);
  ctx.arcTo(x, y + h, x, y, bl);
  ctx.arcTo(x, y, x + w, y, tl);
  ctx.closePath();
}

export function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + h * 0.3);
  ctx.bezierCurveTo(x + w / 2, y + h * 0.27, x + w * 0.45, y, x + w * 0.25, y);
  ctx.bezierCurveTo(x, y, x, y + h * 0.3, x, y + h * 0.3);
  ctx.bezierCurveTo(x, y + h * 0.55, x + w * 0.2, y + h * 0.77, x + w / 2, y + h);
  ctx.bezierCurveTo(x + w * 0.8, y + h * 0.77, x + w, y + h * 0.55, x + w, y + h * 0.3);
  ctx.bezierCurveTo(x + w, y + h * 0.3, x + w, y, x + w * 0.75, y);
  ctx.bezierCurveTo(x + w * 0.55, y, x + w / 2, y + h * 0.27, x + w / 2, y + h * 0.3);
  ctx.closePath();
}

function hexagonPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const r = Math.min(w / 2, h / Math.sqrt(3));
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const px = cx + r * Math.cos(a);
    const py = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** Traces the design's outline, shrunk inwards by `inset` px on every side */
function shapePath(ctx: CanvasRenderingContext2D, design: Design, width: number, height: number, inset = 0) {
  const x = inset, y = inset, w = width - inset * 2, h = height - inset * 2;
  const short = Math.min(width, height);
  if (design.shape === "circle") {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (design.shape === "heart") {
    heartPath(ctx, x, y, w, h);
  } else if (design.shape === "hexagon") {
    hexagonPath(ctx, x, y, w, h);
  } else {
    const radii = (design.corners ?? [design.radius, design.radius, design.radius, design.radius]).map((r) => r * short - inset);
    roundedRectPath(ctx, x, y, w, h, radii);
  }
}

// ── Themes (backgrounds for text designs) ────────────────────────────────────

const THEME_TEXT: Record<ThemeId, string> = {
  amber: "#451a03",
  marble: "#1c1917",
  midnight: "#f8fafc",
  rose: "#831843",
  sunset: "#ffffff",
  wood: "#fef3c7",
  "black-gold": "#d4af37",
  ivory: "#1c1917",
};

/** Deterministic pseudo-random numbers so patterns look the same on every render */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function flower(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.5, r * 0.3, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function drawTheme(ctx: CanvasRenderingContext2D, theme: ThemeId, w: number, h: number) {
  const short = Math.min(w, h);
  const rand = seeded(7);
  const linear = (stops: string[], x1 = 0, y1 = 0, x2 = w, y2 = h) => {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    return g;
  };

  switch (theme) {
    case "amber":
      ctx.fillStyle = linear(["#fde68a", "#f59e0b", "#b45309"]);
      ctx.fillRect(0, 0, w, h);
      break;
    case "marble": {
      ctx.fillStyle = linear(["#fafaf9", "#f5f5f4", "#e7e5e4"]);
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) {
        ctx.strokeStyle = i === 4 ? "rgba(201,162,39,0.45)" : `rgba(120,113,108,${0.12 + rand() * 0.25})`;
        ctx.lineWidth = short * (0.002 + rand() * 0.005);
        ctx.beginPath();
        ctx.moveTo(rand() * w * 0.4, -10);
        ctx.bezierCurveTo(rand() * w, h * 0.3, rand() * w, h * 0.7, w * (0.5 + rand() * 0.5), h + 10);
        ctx.stroke();
      }
      break;
    }
    case "midnight": {
      ctx.fillStyle = linear(["#0f172a", "#1e3a8a"]);
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.2 + rand() * 0.5})`;
        ctx.beginPath();
        ctx.arc(rand() * w, rand() * h, short * (0.002 + rand() * 0.004), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = linear(["rgba(255,255,255,0)", "rgba(255,255,255,0.12)", "rgba(255,255,255,0)"], 0, 0, w, h * 0.6);
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "rose": {
      ctx.fillStyle = linear(["#fff1f2", "#fce7f3", "#fbcfe8"]);
      ctx.fillRect(0, 0, w, h);
      const r = short * 0.13;
      flower(ctx, r * 0.9, r * 0.9, r, "#f9a8d4");
      flower(ctx, r * 2.1, r * 0.55, r * 0.6, "#f472b6");
      flower(ctx, w - r * 0.9, h - r * 0.9, r, "#f9a8d4");
      flower(ctx, w - r * 2.1, h - r * 0.55, r * 0.6, "#f472b6");
      break;
    }
    case "sunset": {
      ctx.fillStyle = linear(["#fb923c", "#f43f5e", "#7c3aed"], 0, 0, 0, h);
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(254,240,138,0.85)";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.86, short * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(76,29,149,0.85)";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.82);
      ctx.quadraticCurveTo(w * 0.25, h * 0.7, w * 0.55, h * 0.86);
      ctx.quadraticCurveTo(w * 0.8, h * 0.76, w, h * 0.84);
      ctx.lineTo(w, h);
      ctx.fill();
      ctx.fillStyle = "#3b0764";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.92);
      ctx.quadraticCurveTo(w * 0.4, h * 0.84, w, h * 0.94);
      ctx.lineTo(w, h);
      ctx.fill();
      break;
    }
    case "wood": {
      ctx.fillStyle = linear(["#a16207", "#92400e", "#78350f"]);
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 28; i++) {
        const y0 = (h / 28) * i + rand() * 6;
        ctx.strokeStyle = `rgba(0,0,0,${0.06 + rand() * 0.1})`;
        ctx.lineWidth = short * (0.002 + rand() * 0.004);
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.bezierCurveTo(w * 0.3, y0 + (rand() - 0.5) * 20, w * 0.7, y0 + (rand() - 0.5) * 20, w, y0);
        ctx.stroke();
      }
      break;
    }
    case "black-gold": {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, short * 0.7);
      g.addColorStop(0, "#292524");
      g.addColorStop(1, "#0c0a09");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      break;
    }
    case "ivory":
      ctx.fillStyle = linear(["#fffbeb", "#fef3c7"]);
      ctx.fillRect(0, 0, w, h);
      break;
  }
}

// ── Text ────────────────────────────────────────────────────────────────────

function drawTexts(ctx: CanvasRenderingContext2D, design: Design, opts: RenderOptions, w: number, h: number) {
  const short = Math.min(w, h);
  const defaultColor = design.theme ? THEME_TEXT[design.theme] : "#ffffff";
  for (const layer of design.texts ?? []) {
    let text = layer.fixed ? layer.default : opts.texts?.[layer.id] ?? layer.default;
    text = text.trim();
    if (!text) continue;
    if (layer.uppercase) text = text.toUpperCase();

    const fontId: FontId = layer.font === "primary" ? opts.font ?? design.font ?? "playfair" : layer.font;
    const font = FONTS[fontId];
    let px = layer.size * short;
    ctx.font = `${font.weight} ${px}px ${font.family}`;
    const maxW = layer.maxWidth * w;
    const measured = ctx.measureText(text).width;
    if (measured > maxW) {
      px *= maxW / measured;
      ctx.font = `${font.weight} ${px}px ${font.family}`;
    }
    ctx.save();
    ctx.fillStyle = layer.color ?? defaultColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (design.theme === "sunset" || design.theme === "midnight") {
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = px * 0.12;
    }
    ctx.fillText(text, layer.x * w, layer.y * h);
    ctx.restore();
  }
}

// ── Clock ───────────────────────────────────────────────────────────────────

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

function clockGeometry(design: Design, w: number, h: number) {
  const short = Math.min(w, h);
  const factor = design.shape === "heart" ? 0.3 : design.shape === "hexagon" ? 0.36 : design.dualBorder ? 0.35 : 0.39;
  return { cx: w / 2, cy: design.shape === "heart" ? h * 0.5 : h / 2, r: short * factor, short };
}

function drawClockFace(ctx: CanvasRenderingContext2D, design: Design, face: ClockFace, color: string, w: number, h: number) {
  const { cx, cy, r, short } = clockGeometry(design, w, h);
  const light = color.toLowerCase() === "#ffffff";
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.shadowColor = light ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.5)";
  ctx.shadowBlur = short * 0.012;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (face === "ticks") {
    ctx.lineCap = "round";
    for (let i = 0; i < 60; i++) {
      const a = (Math.PI * 2 * i) / 60 - Math.PI / 2;
      const hour = i % 5 === 0;
      const len = short * (hour ? 0.06 : 0.02);
      ctx.lineWidth = short * (hour ? 0.016 : 0.005);
      const outer = r + short * 0.04;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
      ctx.lineTo(cx + Math.cos(a) * (outer - len), cy + Math.sin(a) * (outer - len));
      ctx.stroke();
    }
  } else {
    const hours = face === "bold" ? [0, 3, 6, 9] : [...Array(12).keys()];
    const font = face === "bold" ? FONTS.bebas : face === "roman" ? FONTS.cinzel : FONTS.poppins;
    const size = short * (face === "bold" ? 0.14 : face === "roman" ? 0.065 : 0.085);
    ctx.font = `${font.weight} ${size}px ${font.family}`;
    for (const i of hours) {
      const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
      const label = face === "roman" ? ROMAN[i] : String(i === 0 ? 12 : i);
      ctx.fillText(label, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
  }
  ctx.restore();
}

/** Hands are only drawn in previews — the real hands are fitted on top of the print */
function drawClockHands(ctx: CanvasRenderingContext2D, design: Design, color: string, w: number, h: number) {
  const { cx, cy, r, short } = clockGeometry(design, w, h);
  const hand = (angle: number, length: number, width: number, stroke: string) => {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(cx - Math.cos(angle) * length * 0.15, cy - Math.sin(angle) * length * 0.15);
    ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
    ctx.stroke();
  };
  const handColor = color.toLowerCase() === "#ffffff" ? "#111111" : color;
  ctx.save();
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = short * 0.01;
  ctx.shadowOffsetY = short * 0.004;
  // 10:10:30 — the classic display time
  hand(((10 + 10 / 60) / 12) * Math.PI * 2 - Math.PI / 2, r * 0.55, short * 0.026, handColor);
  hand((10 / 60) * Math.PI * 2 - Math.PI / 2, r * 0.8, short * 0.018, handColor);
  hand((30 / 60) * Math.PI * 2 - Math.PI / 2, r * 0.88, short * 0.006, "#dc2626");
  ctx.fillStyle = handColor;
  ctx.beginPath();
  ctx.arc(cx, cy, short * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── Compose ─────────────────────────────────────────────────────────────────

export interface SlotFill {
  image: HTMLImageElement | null;
  /** Defaults to a centred cover crop */
  crop?: PixelCrop | null;
}

export interface RenderOptions {
  slots?: SlotFill[];
  texts?: Record<string, string>;
  font?: FontId;
  clock?: { face: ClockFace; color: string };
  /** Draw clock hands (previews only — never on the print file) */
  showHands?: boolean;
}

/** Inner box (inside any dual border) that photo slots are laid out in */
export function innerBox(design: Design, width: number, height: number) {
  const margin = design.dualBorder ? design.dualBorder.margin * Math.min(width, height) : 0;
  return { x: margin, y: margin, w: width - margin * 2, h: height - margin * 2, margin };
}

/** Width / height of a photo slot when the design is drawn at the given aspect */
export function slotAspect(design: Design, slotIndex: number, aspect: number): number {
  const box = innerBox(design, aspect * 1000, 1000);
  const slot = design.slots![slotIndex];
  return (box.w * slot.w) / (box.h * slot.h);
}

/**
 * Draws a design onto `canvas` at width × height. Empty photo slots get a neutral
 * placeholder so the gallery shows each design before a photo is picked.
 */
export function drawDesign(canvas: HTMLCanvasElement, design: Design, opts: RenderOptions, width: number, height: number) {
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser");
  const w = canvas.width, h = canvas.height;
  const short = Math.min(w, h);
  const box = innerBox(design, w, h);
  const slots = design.slots ?? [];

  ctx.clearRect(0, 0, w, h);

  // Base: theme background, or white behind borders and collage gaps
  ctx.save();
  shapePath(ctx, design, w, h);
  ctx.clip();
  if (design.theme) {
    drawTheme(ctx, design.theme, w, h);
  } else if (design.dualBorder || slots.length > 1) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // Photos
  if (slots.length) {
    ctx.save();
    shapePath(ctx, design, w, h, box.margin);
    ctx.clip();
    slots.forEach((slot, i) => {
      const sx = box.x + slot.x * box.w, sy = box.y + slot.y * box.h;
      const sw = slot.w * box.w, sh = slot.h * box.h;
      const fill = opts.slots?.[i];
      ctx.save();
      ctx.beginPath();
      ctx.rect(sx, sy, sw, sh);
      ctx.clip();
      if (fill?.image) {
        const img = fill.image;
        const base = fill.crop ?? coverCrop(img.naturalWidth, img.naturalHeight, sw / sh);
        const c = fitCropToAspect(base, sw / sh, img.naturalWidth, img.naturalHeight);
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, c.x, c.y, c.width, c.height, sx, sy, sw, sh);
      } else {
        const g = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
        g.addColorStop(0, i % 2 ? "#e7e5e4" : "#ede6d3");
        g.addColorStop(1, i % 2 ? "#d6d3d1" : "#d6cfc0");
        ctx.fillStyle = g;
        ctx.fillRect(sx, sy, sw, sh);
      }
      ctx.restore();
    });
    ctx.restore();
  }

  if (design.dualBorder) {
    ctx.save();
    shapePath(ctx, design, w, h, box.margin / 2);
    ctx.lineWidth = Math.max(1, design.dualBorder.line * short);
    ctx.strokeStyle = design.dualBorder.lineColor;
    ctx.stroke();
    ctx.restore();
  }

  for (const line of design.frameLines ?? []) {
    ctx.save();
    shapePath(ctx, design, w, h, line.inset * short);
    ctx.lineWidth = Math.max(1, line.width * short);
    ctx.strokeStyle = line.color;
    ctx.stroke();
    ctx.restore();
  }

  drawTexts(ctx, design, opts, w, h);

  const clock = opts.clock ?? design.clock;
  if (clock) {
    drawClockFace(ctx, design, clock.face, clock.color, w, h);
    if (opts.showHands) drawClockHands(ctx, design, clock.color, w, h);
  }

  // Glossy acrylic sheen
  ctx.save();
  shapePath(ctx, design, w, h);
  ctx.clip();
  const sheen = ctx.createLinearGradient(0, 0, w * 0.6, h);
  sheen.addColorStop(0, "rgba(255,255,255,0.18)");
  sheen.addColorStop(0.35, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/** Renders the design at print aspect as a PNG blob (transparent outside the shape). */
export function bakeDesign(design: Design, opts: RenderOptions, aspect: number, longSide = 1600): Promise<Blob> {
  const width = aspect >= 1 ? longSide : longSide * aspect;
  const height = aspect >= 1 ? longSide / aspect : longSide;
  const canvas = document.createElement("canvas");
  drawDesign(canvas, design, opts, width, height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not render preview"))), "image/png")
  );
}

/** Phone photos can exceed the 10 MB upload limit — re-encode those as a high-quality JPEG. */
export async function prepareOriginalForUpload(file: File, image: HTMLImageElement): Promise<File> {
  const LIMIT = 9.5 * 1024 * 1024;
  if (file.size <= LIMIT) return file;
  const scale = Math.min(1, 6000 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.92, 0.85, 0.75]) {
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (blob && blob.size <= LIMIT) {
      return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    }
  }
  throw new Error("Photo is too large. Please choose a photo under 10 MB.");
}

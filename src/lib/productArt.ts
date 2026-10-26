// Canvas-drawn catalogue images: every product and category picture on the site is
// rendered here, so the shop never shows stock photos of things we don't sell.
// Acrylic photos, clocks and name plates reuse the design gallery's renderer;
// everything else is drawn as an acrylic mockup with a "your photo" placeholder.
// Regenerate the files at /dev/product-art (development only).

import { designAspect, getDesign } from "@/lib/designs";
import { drawDesign, heartPath, roundedRectPath, slotRects } from "@/lib/designs/render";
import { FONTS } from "@/lib/designs/fonts";
import type { FontId } from "@/lib/designs";

type Ctx = CanvasRenderingContext2D;
type Draw = (ctx: Ctx, W: number, H: number) => void;

const SHADOW = "rgba(41, 31, 20, 0.30)";

// ── Building blocks ─────────────────────────────────────────────────────────

function newCanvas(w: number, h: number): [HTMLCanvasElement, Ctx] {
  const c = document.createElement("canvas");
  c.width = Math.round(w);
  c.height = Math.round(h);
  return [c, c.getContext("2d")!];
}

function backdrop(ctx: Ctx, W: number, H: number) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#faf7f0");
  g.addColorStop(1, "#ebe3d2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, Math.max(W, H) * 0.7);
  glow.addColorStop(0, "rgba(255,255,255,0.6)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

/** Draws a prepared piece centred at (cx, cy), rotated by `deg`, with a soft drop shadow. */
function place(ctx: Ctx, piece: HTMLCanvasElement, cx: number, cy: number, deg = 0, lift = 1) {
  const u = Math.max(piece.width, piece.height);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.shadowColor = SHADOW;
  ctx.shadowBlur = u * 0.07 * lift;
  ctx.shadowOffsetY = u * 0.04 * lift;
  ctx.drawImage(piece, -piece.width / 2, -piece.height / 2);
  ctx.restore();
}

/** Where a point inside a placed piece ends up on the main canvas. */
function placedPoint(piece: HTMLCanvasElement, cx: number, cy: number, deg: number, px: number, py: number) {
  const a = (deg * Math.PI) / 180;
  const dx = px - piece.width / 2, dy = py - piece.height / 2;
  return { x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) };
}

/** Sun-and-hills glyph marking where the customer's photo goes. */
function photoGlyph(ctx: Ctx, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.fillStyle = "rgba(112, 96, 76, 0.32)";
  ctx.beginPath();
  ctx.arc(cx + size * 0.22, cy - size * 0.2, size * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.5, cy + size * 0.3);
  ctx.lineTo(cx - size * 0.13, cy - size * 0.12);
  ctx.lineTo(cx + size * 0.1, cy + size * 0.12);
  ctx.lineTo(cx + size * 0.25, cy - size * 0.02);
  ctx.lineTo(cx + size * 0.5, cy + size * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** The same neutral photo placeholder the design gallery uses, plus the glyph. */
function photoFill(ctx: Ctx, x: number, y: number, w: number, h: number, i = 0) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, i % 2 ? "#e7e5e4" : "#ede6d3");
  g.addColorStop(1, i % 2 ? "#d6d3d1" : "#d6cfc0");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  photoGlyph(ctx, x + w / 2, y + h / 2, Math.min(w, h) * 0.42);
}

function sheen(ctx: Ctx, x: number, y: number, w: number, h: number, strength = 0.22) {
  const g = ctx.createLinearGradient(x, y, x + w * 0.6, y + h);
  g.addColorStop(0, `rgba(255,255,255,${strength})`);
  g.addColorStop(0.38, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

type Shape = (ctx: Ctx, w: number, h: number) => void;

const rounded = (frac: number): Shape => (ctx, w, h) => roundedRectPath(ctx, 0, 0, w, h, Array(4).fill(Math.min(w, h) * frac));
const circle: Shape = (ctx, w, h) => {
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
};
const heart: Shape = (ctx, w, h) => heartPath(ctx, 0, 0, w, h);
const house: Shape = (ctx, w, h) => {
  const r = w * 0.06;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w, h * 0.3);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.lineTo(0, h * 0.3);
  ctx.closePath();
};

interface Hole {
  x: number;
  y: number;
  /** Circle radius, or half-width of a slot when `slot` is set */
  r: number;
  slot?: boolean;
}

/** A printed acrylic piece: photo placeholder clipped to the shape, glossy sheen,
 *  bright polished edge, and an optional hole cut right through. */
function acrylic(w: number, h: number, shape: Shape, photo = 0, hole?: Hole): HTMLCanvasElement {
  const [c, ctx] = newCanvas(w, h);
  const edge = Math.max(2, Math.min(w, h) * 0.022);
  ctx.save();
  shape(ctx, c.width, c.height);
  ctx.clip();
  photoFill(ctx, 0, 0, c.width, c.height, photo);
  sheen(ctx, 0, 0, c.width, c.height);
  ctx.restore();

  ctx.save();
  shape(ctx, c.width, c.height);
  ctx.clip();
  shape(ctx, c.width, c.height);
  ctx.lineWidth = edge * 2;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.stroke();
  ctx.restore();

  if (hole) {
    const draw = () => {
      ctx.beginPath();
      if (hole.slot) roundedRectPath(ctx, hole.x - hole.r, hole.y - hole.r * 0.22, hole.r * 2, hole.r * 0.44, Array(4).fill(hole.r * 0.22));
      else ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
    };
    ctx.save();
    draw();
    ctx.lineWidth = edge * 2.2;
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.stroke();
    ctx.globalCompositeOperation = "destination-out";
    draw();
    ctx.fill();
    ctx.restore();
  }
  return c;
}

function metal(ctx: Ctx, x0: number, y0: number, x1: number, y1: number) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#f4f4f5");
  g.addColorStop(0.35, "#a1a1aa");
  g.addColorStop(0.6, "#e4e4e7");
  g.addColorStop(1, "#71717a");
  return g;
}

/** Split ring threaded through a keychain hole. */
function keyRing(ctx: Ctx, hx: number, hy: number, r: number, tilt: number) {
  const a = ((tilt - 90) * Math.PI) / 180;
  const cx = hx + Math.cos(a) * r * 0.82, cy = hy + Math.sin(a) * r * 0.82;
  ctx.save();
  ctx.shadowColor = "rgba(41,31,20,0.25)";
  ctx.shadowBlur = r * 0.25;
  ctx.shadowOffsetY = r * 0.12;
  ctx.lineWidth = r * 0.16;
  ctx.strokeStyle = metal(ctx, cx - r, cy - r, cx + r, cy + r);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function font(id: FontId, px: number) {
  const f = FONTS[id];
  return `${f.weight} ${px}px ${f.family}`;
}

function fitText(ctx: Ctx, text: string, id: FontId, px: number, maxW: number) {
  ctx.font = font(id, px);
  const w = ctx.measureText(text).width;
  if (w > maxW) ctx.font = font(id, (px * maxW) / w);
}

// ── Design-gallery products ─────────────────────────────────────────────────

/** Renders a gallery design (as customers see it before adding a photo). */
function designPiece(slug: string, maxW: number, maxH: number): HTMLCanvasElement {
  const design = getDesign(slug);
  if (!design) throw new Error(`Unknown design ${slug}`);
  const aspect = designAspect(design);
  const w = Math.min(maxW, maxH * aspect);
  const h = w / aspect;
  const [c, ctx] = newCanvas(w, h);
  drawDesign(c, design, { showHands: Boolean(design.clock) }, c.width, c.height);
  if (!design.clock) {
    for (const r of slotRects(design, aspect)) {
      photoGlyph(ctx, (r.left + r.width / 2) * c.width, (r.top + r.height / 2) * c.height, Math.min(r.width * c.width, r.height * c.height) * 0.36);
    }
  }
  return c;
}

const designArt = (slug: string): Draw => (ctx, W, H) => {
  const u = Math.min(W, H);
  place(ctx, designPiece(slug, u * 0.76, u * 0.76), W / 2, H / 2);
};

const designPair = (a: string, b: string): Draw => (ctx, W, H) => {
  const u = Math.min(W, H);
  place(ctx, designPiece(a, W * 0.4, u * 0.7), W * 0.3, H / 2, -3);
  place(ctx, designPiece(b, W * 0.4, u * 0.62), W * 0.71, H * 0.53, 3);
};

// ── Mockups for products outside the design gallery ─────────────────────────

const squareMagnets: Draw = (ctx, W, H) => {
  const u = Math.min(W, H);
  place(ctx, acrylic(u * 0.38, u * 0.38, rounded(0.06), 0), W * 0.37, H * 0.42, -6);
  place(ctx, acrylic(u * 0.28, u * 0.28, rounded(0.06), 1), W * 0.68, H * 0.36, 5);
  place(ctx, acrylic(u * 0.22, u * 0.22, rounded(0.06), 1), W * 0.62, H * 0.68, -3);
};

const heartMagnets: Draw = (ctx, W, H) => {
  const u = Math.min(W, H);
  place(ctx, acrylic(u * 0.44, u * 0.4, heart, 0), W * 0.4, H * 0.45, -8);
  place(ctx, acrylic(u * 0.3, u * 0.27, heart, 1), W * 0.7, H * 0.62, 9);
};

const framedPhoto: Draw = (ctx, W, H) => {
  const u = Math.min(W, H);
  const h = u * 0.76, w = h / 1.414;
  const [c, f] = newCanvas(w, h);
  const bw = w * 0.055;
  f.fillStyle = metal(f, 0, 0, c.width, c.height);
  roundedRectPath(f, 0, 0, c.width, c.height, [w * 0.012, w * 0.012, w * 0.012, w * 0.012]);
  f.fill();
  f.strokeStyle = "rgba(0,0,0,0.18)";
  f.lineWidth = 1.5;
  f.strokeRect(bw, bw, c.width - bw * 2, c.height - bw * 2);
  photoFill(f, bw, bw, c.width - bw * 2, c.height - bw * 2);
  sheen(f, bw, bw, c.width - bw * 2, c.height - bw * 2, 0.26);
  place(ctx, c, W / 2, H / 2);
};

const squareRoundKeychains: Draw = (ctx, W, H) => {
  const u = Math.min(W, H);
  const s = u * 0.32;
  const sq = acrylic(s, s, rounded(0.16), 0, { x: s / 2, y: s * 0.11, r: s * 0.045 });
  const rd = acrylic(s, s, circle, 1, { x: s / 2, y: s * 0.1, r: s * 0.045 });
  const pieces = [
    { piece: sq, x: W * 0.35, y: H * 0.58, deg: -9, hy: s * 0.11 },
    { piece: rd, x: W * 0.66, y: H * 0.55, deg: 8, hy: s * 0.1 },
  ];
  for (const p of pieces) {
    place(ctx, p.piece, p.x, p.y, p.deg);
    const hole = placedPoint(p.piece, p.x, p.y, p.deg, s / 2, p.hy);
    keyRing(ctx, hole.x, hole.y, u * 0.06, p.deg);
  }
};

const heartKeychains: Draw = (ctx, W, H) => {
  const u = Math.min(W, H);
  const w = u * 0.36, h = u * 0.33;
  const hole = { x: w * 0.26, y: h * 0.12, r: w * 0.035 };
  const pieces = [
    { piece: acrylic(w, h, heart, 0, hole), x: W * 0.36, y: H * 0.58, deg: -10 },
    { piece: acrylic(w, h, heart, 1, hole), x: W * 0.66, y: H * 0.56, deg: 9 },
  ];
  for (const p of pieces) {
    place(ctx, p.piece, p.x, p.y, p.deg);
    const pt = placedPoint(p.piece, p.x, p.y, p.deg, hole.x, hole.y);
    keyRing(ctx, pt.x, pt.y, u * 0.06, p.deg);
  }
};

/** Leather strap looped through a luggage tag's hole. */
function strap(ctx: Ctx, hx: number, hy: number, u: number, tilt: number) {
  const rx = u * 0.06, ry = u * 0.13;
  ctx.save();
  // Loop stands up from the hole, tilted with the tag
  ctx.translate(hx, hy);
  ctx.rotate((tilt * Math.PI) / 180);
  ctx.shadowColor = "rgba(41,31,20,0.25)";
  ctx.shadowBlur = u * 0.02;
  ctx.shadowOffsetY = u * 0.01;
  ctx.lineWidth = u * 0.03;
  ctx.strokeStyle = "#4a3222";
  ctx.beginPath();
  ctx.ellipse(0, -ry * 0.92, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowColor = "transparent";
  ctx.lineWidth = u * 0.005;
  ctx.strokeStyle = "rgba(255,236,200,0.4)";
  ctx.setLineDash([u * 0.012, u * 0.01]);
  ctx.stroke();
  ctx.setLineDash([]);
  // Metal clamp where the strap closes on the tag
  ctx.fillStyle = metal(ctx, -u * 0.03, 0, u * 0.03, 0);
  roundedRectPath(ctx, -u * 0.028, -u * 0.035, u * 0.056, u * 0.03, Array(4).fill(u * 0.008));
  ctx.fill();
  ctx.restore();
}

const tagArt = (shape: Shape, w: number, h: number, hole: (w: number, h: number) => Hole): Draw => (ctx, W, H) => {
  const u = Math.min(W, H);
  const pw = u * w, ph = u * h;
  const hl = hole(pw, ph);
  const back = acrylic(pw, ph, shape, 1, hl);
  const front = acrylic(pw, ph, shape, 0, hl);
  const items = [
    { piece: back, x: W * 0.62, y: H * 0.6, deg: 10 },
    { piece: front, x: W * 0.42, y: H * 0.62, deg: -6 },
  ];
  for (const t of items) {
    place(ctx, t.piece, t.x, t.y, t.deg);
    const pt = placedPoint(t.piece, t.x, t.y, t.deg, hl.x, hl.y);
    strap(ctx, pt.x, pt.y, u, t.deg);
  }
};

const houseTag = tagArt(house, 0.34, 0.46, (w, h) => ({ x: w / 2, y: h * 0.17, r: w * 0.05 }));
const roundedTag = tagArt(rounded(0.14), 0.32, 0.48, (w, h) => ({ x: w / 2, y: h * 0.09, r: w * 0.16, slot: true }));

const miniGallery: Draw = (ctx, W, H) => {
  const u = Math.min(W, H);
  const s = u * 0.25, gap = u * 0.035;
  const x0 = W / 2 - (s * 3 + gap * 2) / 2 + s / 2;
  const y0 = H / 2 - (s * 2 + gap) / 2 + s / 2;
  for (let r = 0; r < 2; r++) {
    for (let col = 0; col < 3; col++) {
      place(ctx, acrylic(s, s, rounded(0.05), (r + col) % 2), x0 + col * (s + gap), y0 + r * (s + gap), 0, 0.7);
    }
  }
};

const photoStand: Draw = (ctx, W, H) => {
  const u = Math.min(W, H);
  const w = u * 0.44, h = u * 0.58, t = u * 0.045;
  const x = W / 2 - w / 2 - t / 2, y = H * 0.47 - h / 2;
  // Desk surface
  const desk = ctx.createLinearGradient(0, y + h, 0, H);
  desk.addColorStop(0, "rgba(120,96,70,0.10)");
  desk.addColorStop(1, "rgba(120,96,70,0.22)");
  ctx.fillStyle = desk;
  ctx.fillRect(0, y + h + t * 0.4, W, H);
  // Contact shadow
  ctx.save();
  ctx.filter = `blur(${u * 0.02}px)`;
  ctx.fillStyle = "rgba(41,31,20,0.35)";
  ctx.beginPath();
  ctx.ellipse(x + w / 2 + t, y + h + t * 0.5, w * 0.6, t * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Block thickness: top and side faces of clear acrylic
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.strokeStyle = "rgba(160,150,135,0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + t, y - t * 0.7);
  ctx.lineTo(x + w + t, y - t * 0.7);
  ctx.lineTo(x + w, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w + t, y - t * 0.7);
  ctx.lineTo(x + w + t, y + h - t * 0.7);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Front face with the photo
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  photoFill(ctx, x, y, w, h);
  sheen(ctx, x, y, w, h, 0.3);
  ctx.restore();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = u * 0.006;
  ctx.strokeRect(x, y, w, h);
};

interface AlbumTheme {
  cover: string;
  spine: string;
  accent: string;
  title: string;
  titleFont: FontId;
  subtitle: string;
  roundPhoto?: boolean;
}

function albumPiece(u: number, theme: AlbumTheme): HTMLCanvasElement {
  const w = u * 0.7, h = u * 0.56, pages = u * 0.018;
  const [c, ctx] = newCanvas(w + pages, h + pages);
  // Page block peeking out behind the cover
  ctx.fillStyle = "#fbfaf7";
  ctx.fillRect(pages, pages, w, h);
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i++) {
    const o = (pages / 6) * i;
    ctx.beginPath();
    ctx.moveTo(w + o, pages + o);
    ctx.lineTo(w + o, h + o);
    ctx.lineTo(pages + o, h + o);
    ctx.stroke();
  }
  // Cover and spine
  roundedRectPath(ctx, 0, 0, w, h, [w * 0.01, w * 0.02, w * 0.02, w * 0.01]);
  ctx.fillStyle = theme.cover;
  ctx.fill();
  ctx.fillStyle = theme.spine;
  ctx.fillRect(0, 0, w * 0.07, h);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(w * 0.07, 0, w * 0.006, h);
  // Photo window
  const pw = w * 0.44, ph = h * 0.48, px = w * 0.07 + (w * 0.93 - pw) / 2, py = h * 0.12;
  ctx.save();
  if (theme.roundPhoto) {
    ctx.beginPath();
    ctx.arc(px + pw / 2, py + ph / 2, ph / 2, 0, Math.PI * 2);
  } else {
    roundedRectPath(ctx, px, py, pw, ph, Array(4).fill(w * 0.01));
  }
  ctx.lineWidth = w * 0.012;
  ctx.strokeStyle = theme.accent;
  ctx.stroke();
  ctx.clip();
  photoFill(ctx, px, py, pw, ph);
  ctx.restore();
  // Title
  const cx = w * 0.07 + (w * 0.93) / 2;
  ctx.fillStyle = theme.accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  fitText(ctx, theme.title, theme.titleFont, h * 0.11, w * 0.8);
  ctx.fillText(theme.title, cx, h * 0.73);
  ctx.font = font("poppins", h * 0.035);
  ctx.globalAlpha = 0.85;
  ctx.fillText(theme.subtitle.split("").join(String.fromCharCode(8202)), cx, h * 0.86);
  ctx.globalAlpha = 1;
  sheen(ctx, 0, 0, w, h, 0.14);
  return c;
}

const albumArt = (theme: AlbumTheme): Draw => (ctx, W, H) => {
  const u = Math.min(W, H);
  place(ctx, albumPiece(u, theme), W / 2, H / 2, -2);
};

const ALBUMS: Record<string, AlbumTheme> = {
  travel: { cover: "#1f3b4d", spine: "#162b38", accent: "#e8c872", title: "Miles of Memories", titleFont: "playfair", subtitle: "TRAVEL JOURNAL" },
  baby: { cover: "#f5d3da", spine: "#e9b9c4", accent: "#a3405f", title: "Tiny Toes, Big Love", titleFont: "dancing", subtitle: "BABY'S FIRST YEAR" },
  anniversary: { cover: "#5b1a26", spine: "#43121c", accent: "#d4af37", title: "He & She", titleFont: "great-vibes", subtitle: "OUR LOVE STORY", roundPhoto: true },
};

const albumPair: Draw = (ctx, W, H) => {
  const u = Math.min(W, H);
  place(ctx, albumPiece(u * 0.8, ALBUMS.baby), W * 0.36, H * 0.44, -6);
  place(ctx, albumPiece(u * 0.8, ALBUMS.travel), W * 0.62, H * 0.58, 4);
};

// ── Catalogue ───────────────────────────────────────────────────────────────

export const PRODUCT_ART: Record<string, Draw> = {
  "customised-wall-clock": designArt("circle-acrylic-photo-wall-clock"),
  "customised-name-plate": designArt("classic-amber-name-plate"),
  "customised-monogram-name-plate": designArt("acrylic-monogram-round-name-plate"),
  "customised-acrylic-photo": designArt("rounded-rect-landscape-acrylic-wall-photo"),
  "portrait-acrylic-photo-print": designArt("portrait-acrylic-wall-photo"),
  "circle-acrylic-photo-print": designArt("circle-acrylic-wall-photo"),
  "square-round-acrylic-wall-clock": designArt("square-round-acrylic-photo-wall-clock"),
  "heart-acrylic-wall-clock": designArt("heart-shape-acrylic-wall-clock"),
  "ganesha-acrylic-name-plate": designArt("divine-om-acrylic-name-plate"),
  "marble-acrylic-name-plate": designArt("marble-design-acrylic-name-plate"),
  "owl-monogram-name-plate": designArt("acrylic-midnight-monogram-name-plate"),
  "square-acrylic-fridge-magnet": squareMagnets,
  "heart-acrylic-fridge-magnet": heartMagnets,
  "aluminium-framed-acrylic-photo": framedPhoto,
  "square-round-photo-keychain-set": squareRoundKeychains,
  "heart-photo-keychain-set": heartKeychains,
  "house-shape-luggage-tag": houseTag,
  "rounded-rectangle-luggage-tag": roundedTag,
  "acrylic-mini-wall-gallery-set-of-6": miniGallery,
  "acrylic-photo-stand-desk-frame": photoStand,
  "miles-of-memories-travel-photobook": albumArt(ALBUMS.travel),
  "tiny-toes-big-love-baby-album": albumArt(ALBUMS.baby),
  "he-and-she-anniversary-album": albumArt(ALBUMS.anniversary),
};

export const CATEGORY_ART: Record<string, Draw> = {
  "acrylic-photos": designPair("portrait-acrylic-wall-photo", "circle-acrylic-wall-photo"),
  "wall-clocks": designPair("circle-acrylic-photo-wall-clock", "heart-shape-acrylic-wall-clock"),
  "name-plates": designPair("marble-design-acrylic-name-plate", "acrylic-monogram-round-name-plate"),
  "fridge-magnets": squareMagnets,
  "framed-photos": framedPhoto,
  keychains: squareRoundKeychains,
  "luggage-tags": houseTag,
  "mini-wall-gallery": miniGallery,
  "photo-stands": photoStand,
  "photo-albums": albumPair,
};

/** Renders one catalogue image onto `canvas` at width × height. Load fonts first. */
export function renderArt(canvas: HTMLCanvasElement, draw: Draw, width: number, height: number) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  backdrop(ctx, width, height);
  draw(ctx, width, height);
}

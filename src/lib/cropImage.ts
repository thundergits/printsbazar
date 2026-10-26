import { FramePreset, HEART_POINTS } from "./frames";

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const EXPORT_SIZE = 800;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  HEART_POINTS.forEach(([px, py], i) => {
    const cx = x + px * w;
    const cy = y + py * h;
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.closePath();
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Bakes the cropped region + selected frame's border/mask into a single PNG data URL. */
export async function bakeFramedImage(
  imageSrc: string,
  pixelCrop: PixelCrop,
  frame: FramePreset
): Promise<string> {
  const image = await createImage(imageSrc);
  const bw = frame.borderWidth;
  const photoSize = EXPORT_SIZE - bw * 2;
  const totalHeight = EXPORT_SIZE + (frame.bottomStrip ?? 0);

  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE;
  canvas.height = totalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser");

  if (frame.isHeart) {
    heartPath(ctx, 0, 0, EXPORT_SIZE, EXPORT_SIZE);
    ctx.fillStyle = frame.borderColor;
    ctx.fill();

    ctx.save();
    heartPath(ctx, bw, bw, EXPORT_SIZE - bw * 2, EXPORT_SIZE - bw * 2);
    ctx.clip();
    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      bw, bw, photoSize, photoSize
    );
    ctx.restore();
  } else if (frame.cropShape === "round") {
    ctx.beginPath();
    ctx.arc(EXPORT_SIZE / 2, EXPORT_SIZE / 2, EXPORT_SIZE / 2, 0, Math.PI * 2);
    ctx.fillStyle = frame.borderColor;
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(EXPORT_SIZE / 2, EXPORT_SIZE / 2, photoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      bw, bw, photoSize, photoSize
    );
    ctx.restore();
  } else {
    const r = frame.cornerRadius ?? 0;
    roundedRectPath(ctx, 0, 0, EXPORT_SIZE, totalHeight, r);
    ctx.fillStyle = frame.borderColor;
    ctx.fill();

    ctx.save();
    roundedRectPath(ctx, bw, bw, photoSize, photoSize, Math.max(0, r - bw / 2));
    ctx.clip();
    ctx.drawImage(
      image,
      pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
      bw, bw, photoSize, photoSize
    );
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

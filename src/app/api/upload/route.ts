import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { jsonError } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { storeImage, cloudinaryEnabled } from "@/lib/storage";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXTENSIONS: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp" };

// Minimum resolution for acceptable print quality
const MIN_WIDTH = 800;
const MIN_HEIGHT = 800;

export async function POST(req: NextRequest) {
  // Guest checkout means uploads can't require a login; a design uploads a few files
  const limited = rateLimit(`upload:${clientIp(req)}`, 40, 10 * 60 * 1000);
  if (limited) return limited;

  if (!cloudinaryEnabled() && process.env.NODE_ENV === "production") {
    // Local disk is lost on redeploy and isn't served after `next build`
    console.error("CLOUDINARY_URL is not set; uploads are disabled in production");
    return jsonError("Photo uploads are temporarily unavailable. Please try again later.", 503);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("No file provided", 400);
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonError("Invalid file type. Please use JPG, PNG or WEBP.", 400);
    }
    if (file.size > MAX_SIZE) {
      return jsonError("File too large. Maximum size is 10MB.", 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // ── Image quality check using sharp ──────────────────────────────────────
    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch {
      return jsonError("Could not read image. Please upload a valid JPG, PNG, or WEBP file.", 400);
    }

    // Trust the decoded format, not the browser's MIME type or file name
    const ext = metadata.format ? EXTENSIONS[metadata.format] : undefined;
    if (!ext) {
      return jsonError("Invalid file type. Please use JPG, PNG or WEBP.", 400);
    }

    const { width = 0, height = 0 } = metadata;

    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
      return jsonError(
        `Image resolution is too low (${width}×${height}px). Please upload at least ${MIN_WIDTH}×${MIN_HEIGHT}px for good print quality. Tip: avoid screenshots — use the original photo from your camera or gallery.`,
        400
      );
    }

    // Warn if the image looks like a landscape screenshot (very wide, short)
    const aspectRatio = width / height;
    if (aspectRatio > 2.5 && height < 1000) {
      return jsonError(
        "This looks like a screenshot or banner image. For best print results, please upload a square or portrait photo (e.g., from your camera roll).",
        400
      );
    }
    // ─────────────────────────────────────────────────────────────────────────

    const url = await storeImage(buffer, ext, "maa-stickers/uploads");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload failed:", err);
    return jsonError("Upload failed. Please try again.", 500);
  }
}

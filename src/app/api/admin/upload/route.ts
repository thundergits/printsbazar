import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getAdminSession } from "@/lib/adminAuth";
import { jsonError } from "@/lib/api";
import { storeImage, cloudinaryEnabled } from "@/lib/storage";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const EXTENSIONS: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp" };

// Product images: no print-resolution checks, unlike customer photo uploads
export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return jsonError("Unauthorized", 401);

  if (!cloudinaryEnabled() && process.env.NODE_ENV === "production") {
    console.error("CLOUDINARY_URL is not set; uploads are disabled in production");
    return jsonError("Image uploads are not configured (CLOUDINARY_URL missing).", 503);
  }

  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return jsonError("No file provided", 400);
    if (file.size > MAX_SIZE) return jsonError("File too large. Maximum size is 10MB.", 400);

    const buffer = Buffer.from(await file.arrayBuffer());
    let format: string | undefined;
    try {
      format = (await sharp(buffer).metadata()).format;
    } catch {
      return jsonError("Could not read image. Please upload a valid JPG, PNG, or WEBP file.", 400);
    }
    const ext = format ? EXTENSIONS[format] : undefined;
    if (!ext) return jsonError("Invalid file type. Please use JPG, PNG or WEBP.", 400);

    const url = await storeImage(buffer, ext, "maa-stickers/products");
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Admin upload failed:", err);
    return jsonError("Upload failed. Please try again.", 500);
  }
}

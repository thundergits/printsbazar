import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export const cloudinaryEnabled = () => Boolean(process.env.CLOUDINARY_URL);

/** Stores an image on Cloudinary when CLOUDINARY_URL is set, else in public/uploads (dev only). Returns its URL. */
export async function storeImage(buffer: Buffer, ext: string, folder: string): Promise<string> {
  if (cloudinaryEnabled()) {
    const { v2: cloudinary } = await import("cloudinary");
    // CLOUDINARY_URL env is automatically picked up by the SDK
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ quality: "auto:best" }],
        },
        (err, res) => {
          if (err || !res) reject(err);
          else resolve(res as { secure_url: string });
        }
      );
      uploadStream.end(buffer);
    });
    return result.secure_url;
  }

  // ── Local file storage (development only) ────────────────────────────────
  const filename = `${uuidv4()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

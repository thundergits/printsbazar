import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { z } from "zod";
import { jsonError, parseBody } from "@/lib/api";

const schema = z.object({
  files: z
    .array(
      z.object({
        dir: z.enum(["products", "categories"]),
        name: z.string().regex(/^[a-z0-9-]+$/),
        dataUrl: z.string().startsWith("data:image/webp;base64,"),
      })
    )
    .max(100),
});

/** Saves catalogue images rendered at /dev/product-art. Development only. */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") return jsonError("Not found", 404);
  const { data, error } = await parseBody(req, schema);
  if (error) return error;

  for (const file of data.files) {
    const dir = path.join(process.cwd(), "public", "images", file.dir);
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(file.dataUrl.slice(file.dataUrl.indexOf(",") + 1), "base64");
    await writeFile(path.join(dir, `${file.name}.webp`), bytes);
  }
  return NextResponse.json({ saved: data.files.length });
}

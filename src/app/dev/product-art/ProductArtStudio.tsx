"use client";
import { useEffect, useRef, useState } from "react";
import { loadCanvasFonts } from "@/lib/designs/fonts";
import { CATEGORY_ART, PRODUCT_ART, renderArt } from "@/lib/productArt";

const ITEMS = [
  ...Object.entries(PRODUCT_ART).map(([slug, draw]) => ({ dir: "products", slug, draw, w: 1200, h: 1200 })),
  ...Object.entries(CATEGORY_ART).map(([slug, draw]) => ({ dir: "categories", slug, draw, w: 1200, h: 900 })),
];

export default function ProductArtStudio() {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [status, setStatus] = useState("Rendering…");

  const save = async () => {
    setStatus("Saving…");
    const files = ITEMS.map((item, i) => ({
      dir: item.dir,
      name: item.slug,
      dataUrl: refs.current[i]!.toDataURL("image/webp", 0.9),
    }));
    const res = await fetch("/api/dev/product-art", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ files }),
    });
    const data = await res.json();
    setStatus(res.ok ? `Saved ${data.saved} images to public/images` : `Save failed: ${data.error}`);
  };

  useEffect(() => {
    loadCanvasFonts().then(() => {
      ITEMS.forEach((item, i) => renderArt(refs.current[i]!, item.draw, item.w, item.h));
      setStatus(`Rendered ${ITEMS.length} images`);
      if (new URLSearchParams(window.location.search).has("save")) save();
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Catalogue images</h1>
        <button onClick={save} className="btn-primary px-4 py-2 rounded-xl">Save to public/images</button>
        <span id="status" className="text-sm text-gray-600">{status}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ITEMS.map((item, i) => (
          <figure key={`${item.dir}/${item.slug}`} className="bg-white rounded-xl p-2 shadow-sm">
            <canvas ref={(el) => { refs.current[i] = el; }} className="w-full h-auto rounded-lg" />
            <figcaption className="text-xs text-gray-500 mt-1 truncate">{item.dir}/{item.slug}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

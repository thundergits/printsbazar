"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Sparkles, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Design, getLine, isTextOnly, LineId, lineHref, LINES, startingPrice } from "@/lib/designs";
import { usePhotoStore } from "@/store/photoStore";
import DesignCanvas from "@/components/acrylic/DesignCanvas";
import PhotoPicker from "@/components/acrylic/PhotoPicker";
import TrustStrip from "@/components/acrylic/TrustStrip";

export default function DesignGallery({ lineId }: { lineId: LineId }) {
  const line = getLine(lineId)!;
  const { photos, clear } = usePhotoStore();
  const photo = photos[0] ?? null;
  const [filter, setFilter] = useState("all");

  const usesPhotos = line.designs.some((d) => !isTextOnly(d));
  const designs = filter === "all" ? line.designs : line.designs.filter((d) => d.filters.includes(filter));
  const flow = usesPhotos
    ? ["Select Photo", "Instant Preview", "Select Size", "Checkout"]
    : ["Pick Design", "Personalise", "Select Size", "Checkout"];

  return (
    <div className="min-h-screen bg-cream-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-800 font-medium">{line.title}</span>
        </nav>

        {/* Shop by product */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
          {LINES.map((l) => (
            <Link
              key={l.id}
              href={lineHref(l.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors",
                l.id === line.id ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:text-gray-900 shadow-card"
              )}
            >
              {l.title.replace(/^Acrylic /, "")}
            </Link>
          ))}
        </div>

        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-800 mb-3">{line.title}</h1>
          <p className="text-gray-600">{line.intro}</p>
          <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mt-5 text-xs sm:text-sm font-medium text-gray-500">
            {flow.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="w-3.5 h-3.5 text-brand-400" />}
                <span className={cn(i === (usesPhotos && photo ? 1 : 0) && "text-brand-700")}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {usesPhotos && (
          <div className="max-w-xl mx-auto mb-8">
            {photo ? (
              <div className="flex items-center gap-4 bg-white rounded-2xl shadow-card p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                <img src={photo.url} alt="Your photo" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-500" /> Previewing your photo
                  </p>
                  <p className="text-xs text-gray-500">
                    {photo.image.naturalWidth}×{photo.image.naturalHeight}px · tap a design to customise
                  </p>
                </div>
                <PhotoPicker variant="button" label="Change" />
                <button onClick={clear} aria-label="Remove photo" className="p-2 text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <PhotoPicker label="Select a photo to preview on every design" />
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
          {line.filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border-2 whitespace-nowrap transition-colors",
                filter === f.id
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-brand-300"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {designs.map((design) => (
            <DesignCard key={design.slug} design={design} image={photo?.image ?? null} />
          ))}
        </div>

        <TrustStrip className="mt-12" />

        {usesPhotos && (
          <div className="max-w-2xl mx-auto mt-10 text-sm text-gray-600 space-y-3">
            <h2 className="font-display text-xl font-bold text-gray-800">Is my photo uploaded when I preview?</h2>
            <p>No. Previews are drawn right here in your browser. Your photo is only uploaded when you add your design to the cart.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DesignCard({ design, image }: { design: Design; image: HTMLImageElement | null }) {
  const options = useMemo(
    () => ({ slots: design.slots?.map(() => ({ image })), showHands: true }),
    [design, image]
  );
  const width = design.orientation === "portrait" ? "w-[72%]" : design.orientation === "square" ? "w-[82%]" : "w-full";

  return (
    <Link
      href={`/custom/${design.slug}`}
      className="group bg-white rounded-2xl shadow-card overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square bg-gradient-to-b from-[#efebe3] to-[#e3ddd0] flex items-center justify-center p-6 sm:p-8">
        <div className={width}>
          <DesignCanvas design={design} options={options} renderWidth={300} />
        </div>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <h2 className="text-sm font-semibold text-gray-800 leading-snug mb-1 line-clamp-2">{design.name}</h2>
        <p className="text-xs text-gray-500 mb-3">
          From <span className="font-semibold text-brand-700">{formatPrice(startingPrice(design))}</span>
        </p>
        <span className="mt-auto inline-flex items-center justify-center gap-1 rounded-xl bg-brand-500 group-hover:bg-brand-600 text-white text-sm font-semibold py-2 transition-colors">
          Customise <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

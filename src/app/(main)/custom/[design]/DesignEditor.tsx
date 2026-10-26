"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Clock, Hammer, ImagePlus, MapPin,
  Minus, Plus, RotateCcw, ShoppingCart, Sticker, Truck, ZoomIn, Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import Button from "@/components/ui/Button";
import Rotate3DPreview from "@/components/customizer/Rotate3DPreview";
import PreviewEditor from "@/components/acrylic/PreviewEditor";
import PhotoPicker from "@/components/acrylic/PhotoPicker";
import TrustStrip from "@/components/acrylic/TrustStrip";
import { cn, formatPrice } from "@/lib/utils";
import {
  ClockFace, designAspect, FontId, getDesign, isTextOnly, lineHref, lineOf, PhotoSlot, printPpi, ProductLine,
  qualityFor, sizeDims, sizeLabel, sizesFor, slotInches, startingPrice, THICKNESSES, Thickness,
} from "@/lib/designs";
import { FONTS, PICKABLE_FONTS } from "@/lib/designs/fonts";
import {
  bakeDesign, DEFAULT_PAN, MAX_ZOOM, PanZoom, panCrop, prepareOriginalForUpload, RenderOptions, slotAspect,
} from "@/lib/designs/render";
import { MIN_PHOTO_PX, photoForSlot, usePhotoStore } from "@/store/photoStore";
import { useCartStore } from "@/store/cartStore";

interface DesignEditorProps {
  designSlug: string;
  productId: string | null;
}

type Step = 1 | 2;

interface Estimate { region: string; earliestFormatted: string; latestFormatted: string }

interface PrintPreview { url: string; blob: Blob; aspect: number }

const CLOCK_FACES: { id: ClockFace; label: string }[] = [
  { id: "numbers", label: "1–12" },
  { id: "bold", label: "12·3·6·9" },
  { id: "roman", label: "Roman" },
  { id: "ticks", label: "Lines" },
];

const CLOCK_COLORS = [
  { id: "#ffffff", label: "White" },
  { id: "#111111", label: "Black" },
  { id: "#d4af37", label: "Gold" },
];

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || "Upload failed. Please try again.");
  return data.url;
}

const NO_SLOTS: PhotoSlot[] = [];

const blobToFile = (blob: Blob, name: string) => new File([blob], name, { type: "image/png" });

export default function DesignEditor({ designSlug, productId }: DesignEditorProps) {
  const design = getDesign(designSlug)!;
  const line = lineOf(design);
  const router = useRouter();
  const photos = usePhotoStore((s) => s.photos);
  const setPhoto = usePhotoStore((s) => s.setPhoto);
  const addItem = useCartStore((s) => s.addItem);

  // Stable reference: a fresh [] each render would re-trigger every memo/effect below
  const slots = design.slots ?? NO_SLOTS;
  const textOnly = isTextOnly(design);
  const editableTexts = (design.texts ?? []).filter((t) => !t.fixed);
  const editorAspect = designAspect(design);

  const [step, setStep] = useState<Step>(1);
  const [activeSlot, setActiveSlot] = useState(0);
  // Pan/zoom per slot + photo URL, so a new photo starts centred
  const [pans, setPans] = useState<Record<string, PanZoom>>({});
  const [texts, setTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(editableTexts.map((t) => [t.id, t.default]))
  );
  const [font, setFont] = useState<FontId>(design.font ?? "playfair");
  const [clockFace, setClockFace] = useState<ClockFace>(design.clock?.face ?? "numbers");
  const [clockColor, setClockColor] = useState(design.clock?.color ?? "#ffffff");

  const sizes = sizesFor(design);
  const thicknesses = THICKNESSES.filter((t) => sizes.some((s) => s.prices[t]));
  const [sizeId, setSizeId] = useState(sizes[0].id);
  const [thickness, setThickness] = useState<Thickness>(thicknesses.find((t) => sizes[0].prices[t])!);
  const [quantity, setQuantity] = useState(1);
  const [preview, setPreview] = useState<PrintPreview | null>(null);
  const previewRef = useRef<PrintPreview | null>(null);
  const [adding, setAdding] = useState<"cart" | "buy" | null>(null);

  const [pincode, setPincode] = useState("");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [checking, setChecking] = useState(false);

  const size = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const price = size.prices[thickness];
  const dims = sizeDims(design, size);
  const printAspect = dims.w / dims.h;
  const mounting = line.mounting(size, thickness);

  const slotPhotos = useMemo(() => slots.map((_, i) => photoForSlot(photos, i)), [slots, photos]);
  const panKey = (i: number) => `${i}:${slotPhotos[i]?.url ?? ""}`;
  const slotPans = slots.map((_, i) => pans[panKey(i)] ?? DEFAULT_PAN);
  const panSignature = JSON.stringify(slotPans);
  const active = slotPhotos[activeSlot];
  const activePan = slotPans[activeSlot] ?? DEFAULT_PAN;

  const setSlotPan = (i: number, pan: PanZoom) =>
    setPans((prev) => ({ ...prev, [`${i}:${slotPhotos[i]?.url ?? ""}`]: pan }));

  /** Each slot's crop of its photo when the design is drawn at `aspect` */
  const cropsAt = useCallback(
    (aspect: number) =>
      slots.map((_, i) => {
        const photo = slotPhotos[i];
        if (!photo) return null;
        return panCrop(photo.image.naturalWidth, photo.image.naturalHeight, slotAspect(design, i, aspect), slotPans[i]);
      }),
    // slotPans is rebuilt every render; panSignature tracks its contents
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots, slotPhotos, design, panSignature]
  );

  const optionsAt = useCallback(
    (aspect: number): RenderOptions => {
      const crops = cropsAt(aspect);
      return {
        slots: slots.map((_, i) => ({ image: slotPhotos[i]?.image ?? null, crop: crops[i] })),
        texts,
        font,
        clock: design.clock ? { face: clockFace, color: clockColor } : undefined,
      };
    },
    [cropsAt, slots, slotPhotos, texts, font, design.clock, clockFace, clockColor]
  );

  const liveOptions = useMemo(() => ({ ...optionsAt(editorAspect), showHands: true }), [optionsAt, editorAspect]);
  const printOptions = useMemo(() => optionsAt(printAspect), [optionsAt, printAspect]);
  const printPreviewOptions = useMemo(() => ({ ...printOptions, showHands: true }), [printOptions]);

  // Re-render the print preview whenever the size (and so the aspect) or design changes.
  // The previous render stays on screen until the new one is ready.
  useEffect(() => {
    if (step !== 2) return;
    let cancelled = false;
    bakeDesign(design, printPreviewOptions, printAspect)
      .then((blob) => {
        if (cancelled) return;
        const next = { url: URL.createObjectURL(blob), blob, aspect: printAspect };
        const prev = previewRef.current;
        previewRef.current = next;
        setPreview(next);
        if (prev) URL.revokeObjectURL(prev.url);
      })
      .catch(() => toast.error("Could not render the preview"));
    return () => {
      cancelled = true;
    };
  }, [step, design, printPreviewOptions, printAspect]);

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
  }, []);

  // Only allow ordering once the preview matches the selected size
  const previewReady = !!preview && preview.aspect === printAspect;

  /** Each slot's crop of its original photo, at the selected print size */
  const printCrops = useMemo(() => cropsAt(printAspect), [cropsAt, printAspect]);

  const quality = useMemo(() => {
    if (textOnly || printCrops.some((c) => !c)) return null;
    const ppi = Math.min(...printCrops.map((c, i) => printPpi(c!, slotInches(design, slots[i], size))));
    return qualityFor(ppi);
  }, [textOnly, printCrops, design, slots, size]);

  const missingPhoto = !textOnly && slotPhotos.some((p) => !p);
  const lowResPhoto = slotPhotos.find((p) => p && Math.min(p.image.naturalWidth, p.image.naturalHeight) < MIN_PHOTO_PX);
  const missingText = editableTexts.length > 0 && !texts[editableTexts[0].id]?.trim();
  const canContinue = !missingPhoto && !lowResPhoto && !missingText;

  const selectSize = (id: string) => {
    setSizeId(id);
    const next = sizes.find((s) => s.id === id)!;
    if (!next.prices[thickness]) setThickness(thicknesses.find((t) => next.prices[t])!);
  };

  const goToSize = () => {
    if (!canContinue) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const checkPincode = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(`/api/delivery-estimate?pincode=${pincode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEstimate(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not check this pincode");
    } finally {
      setChecking(false);
    }
  };

  const handleAdd = async (mode: "cart" | "buy") => {
    if (!productId) {
      toast.error("This product isn't available right now. Please try again later.");
      return;
    }
    if (!preview || !previewReady || !price || !canContinue) return;
    setAdding(mode);
    try {
      // Uploads happen only now. Originals are the print masters; the preview is for cart/admin.
      const unique = [...new Map(slotPhotos.filter(Boolean).map((p) => [p!.url, p!])).values()];
      const originalUrls = new Map(
        await Promise.all(
          unique.map(async (p) => [p.url, await uploadFile(await prepareOriginalForUpload(p.file, p.image))] as const)
        )
      );
      const previewUrl = await uploadFile(blobToFile(preview.blob, "preview.png"));
      // Clocks: the print file must not include the hands, which are fitted on top
      const printUrl = design.clock
        ? await uploadFile(blobToFile(await bakeDesign(design, printOptions, printAspect), "print.png"))
        : undefined;

      addItem({
        id: uuidv4(),
        productId,
        name: design.name,
        image: previewUrl,
        price: price.price,
        quantity,
        variantInfo: `Size: ${sizeLabel(design, size)} in, Thickness: ${thickness}`,
        customization: JSON.stringify({
          line: line.id,
          design: design.slug,
          size: size.id,
          thickness,
          photos: slots.length
            ? slots.map((_, i) => {
                const c = printCrops[i]!;
                return {
                  originalUrl: originalUrls.get(slotPhotos[i]!.url),
                  crop: { x: Math.round(c.x), y: Math.round(c.y), width: Math.round(c.width), height: Math.round(c.height) },
                };
              })
            : undefined,
          texts: editableTexts.length ? texts : undefined,
          font: editableTexts.some((t) => t.font === "primary") ? font : undefined,
          clock: design.clock ? { face: clockFace, color: clockColor } : undefined,
          printUrl,
        }),
        uploadedImage: previewUrl,
      });

      if (mode === "buy") {
        router.push("/checkout");
      } else {
        toast.success("Added to cart!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAdding(null);
    }
  };

  const previewWidth = design.orientation === "portrait" ? "w-3/4" : design.orientation === "square" ? "w-[90%]" : "w-full";

  return (
    <div className="min-h-screen bg-cream-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 min-w-0">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <Link href={lineHref(line.id)} className="hover:text-brand-600 whitespace-nowrap">{line.itemName}</Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-gray-800 font-medium truncate">{design.name}</span>
        </nav>

        {/* Progress */}
        <ol className="flex items-center justify-center gap-3 mb-8">
          {[
            { n: 1, label: "Design Editor" },
            { n: 2, label: "Size & 3D" },
          ].map(({ n, label }, i) => (
            <li key={n} className="flex items-center gap-3">
              {i > 0 && <div className={cn("w-10 sm:w-20 h-0.5", step === 2 ? "bg-brand-500" : "bg-gray-200")} />}
              <button
                type="button"
                onClick={() => (n === 1 ? setStep(1) : goToSize())}
                disabled={n === 2 && !canContinue}
                className="flex items-center gap-2 disabled:cursor-not-allowed"
              >
                <span
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                    step === n ? "bg-brand-500 text-white" : step > n ? "bg-brand-100 text-brand-700" : "bg-gray-200 text-gray-500"
                  )}
                >
                  {step > n ? <Check className="w-4 h-4" /> : n}
                </span>
                <span className={cn("text-sm font-semibold", step === n ? "text-gray-800" : "text-gray-500")}>{label}</span>
              </button>
            </li>
          ))}
        </ol>

        {step === 1 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-6 lg:gap-10 items-start">
            {/* Live preview — also the editor */}
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl bg-gradient-to-b from-[#efebe3] to-[#e3ddd0] p-6 sm:p-10 flex justify-center">
                <div className={previewWidth}>
                  <PreviewEditor
                    design={design}
                    aspect={editorAspect}
                    options={liveOptions}
                    slotPhotos={slotPhotos}
                    pans={slotPans}
                    activeSlot={activeSlot}
                    onSelectSlot={setActiveSlot}
                    onPan={setSlotPan}
                    onPickFile={setPhoto}
                  />
                </div>
              </div>
              <p className="text-center text-xs text-gray-500 mt-3">
                {textOnly
                  ? "Live preview — updates as you type"
                  : slots.length > 1
                    ? "Tap a photo to select it · drag to adjust · scroll or pinch to zoom"
                    : "Drag to adjust · scroll or pinch to zoom · drop a photo to replace"}
              </p>
            </div>

            {/* Controls */}
            <div className="space-y-5 min-w-0">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-800">{design.name}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  From <span className="font-semibold text-brand-700">{formatPrice(startingPrice(design))}</span>
                </p>
              </div>

              {!textOnly && (
                <div className="bg-white rounded-2xl shadow-card p-4 space-y-4">
                  {slots.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {slots.map((_, i) => {
                        const p = slotPhotos[i];
                        return (
                          <button
                            key={i}
                            onClick={() => setActiveSlot(i)}
                            className={cn(
                              "flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border-2 text-sm font-medium whitespace-nowrap",
                              activeSlot === i ? "border-brand-500 bg-brand-50 text-brand-800" : "border-gray-200 bg-white text-gray-600"
                            )}
                          >
                            {p ? (
                              // eslint-disable-next-line @next/next/no-img-element -- local object URL
                              <img src={p.url} alt="" className="w-7 h-7 rounded-md object-cover" />
                            ) : (
                              <ImagePlus className="w-5 h-5 m-1 text-gray-400" />
                            )}
                            Photo {i + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {active ? (
                    <>
                      <div className="flex items-center gap-3">
                        <ZoomIn className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <input
                          type="range"
                          min={1}
                          max={MAX_ZOOM}
                          step={0.01}
                          value={activePan.zoom}
                          onChange={(e) => setSlotPan(activeSlot, { ...activePan, zoom: Number(e.target.value) })}
                          aria-label={slots.length > 1 ? `Zoom photo ${activeSlot + 1}` : "Zoom"}
                          className="w-full accent-brand-500"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PhotoPicker
                          variant="button"
                          slot={activeSlot}
                          label={slots.length > 1 && !photos[activeSlot] ? "Use a different photo here" : "Change photo"}
                        />
                        <button
                          type="button"
                          onClick={() => setSlotPan(activeSlot, DEFAULT_PAN)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-brand-700"
                        >
                          <RotateCcw className="w-4 h-4" /> Reset
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p className="font-semibold text-gray-800 mb-1">Add your photo</p>
                      <p className="mb-3">Tap <span className="font-medium">Upload photo</span> on the preview, or drop a photo onto it.</p>
                      <PhotoPicker variant="button" slot={activeSlot} label="Choose a photo" />
                    </div>
                  )}

                  {lowResPhoto && (
                    <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                      A photo is only {lowResPhoto.image.naturalWidth}×{lowResPhoto.image.naturalHeight}px. We need at least {MIN_PHOTO_PX}px on each side to print it — please use the original photo, not a screenshot or WhatsApp copy.
                    </p>
                  )}
                </div>
              )}
              {editableTexts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-card p-4 space-y-4">
                  {editableTexts.map((t) => (
                    <label key={t.id} className="block">
                      <span className="flex justify-between text-sm font-semibold text-gray-800 mb-1.5">
                        {t.label}
                        <span className="font-normal text-xs text-gray-400">{(texts[t.id] ?? "").length}/{t.maxLength}</span>
                      </span>
                      <input
                        value={texts[t.id] ?? ""}
                        maxLength={t.maxLength}
                        onChange={(e) => setTexts((prev) => ({ ...prev, [t.id]: e.target.value }))}
                        className={cn("input py-2", t.uppercase && "uppercase")}
                        placeholder={t.default}
                      />
                    </label>
                  ))}
                  {editableTexts.some((t) => t.font === "primary") && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">Font</p>
                      <div className="grid grid-cols-3 gap-2">
                        {PICKABLE_FONTS.map((id) => (
                          <button
                            key={id}
                            onClick={() => setFont(id)}
                            className={cn(
                              "rounded-xl border-2 px-2 py-2 text-center transition-colors",
                              font === id ? "border-brand-500 bg-brand-50" : "border-gray-200 hover:border-brand-300"
                            )}
                          >
                            <span className={cn("block text-lg leading-tight text-gray-800", FONTS[id].className)}>Aa</span>
                            <span className="block text-[11px] text-gray-500">{FONTS[id].label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {missingText && <p className="text-xs text-red-600">Please enter your {editableTexts[0].label.toLowerCase()}.</p>}
                </div>
              )}

              {design.clock && (
                <div className="bg-white rounded-2xl shadow-card p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Numbers style</p>
                    <div className="grid grid-cols-4 gap-2">
                      {CLOCK_FACES.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setClockFace(f.id)}
                          className={cn(
                            "rounded-xl border-2 px-1 py-2 text-xs font-semibold transition-colors",
                            clockFace === f.id ? "border-brand-500 bg-brand-50 text-brand-800" : "border-gray-200 text-gray-600 hover:border-brand-300"
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Numbers colour</p>
                    <div className="flex gap-3">
                      {CLOCK_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setClockColor(c.id)}
                          aria-label={c.label}
                          title={c.label}
                          className={cn(
                            "w-9 h-9 rounded-full border-2 transition-shadow",
                            clockColor === c.id ? "border-brand-500 ring-2 ring-brand-200" : "border-gray-300"
                          )}
                          style={{ backgroundColor: c.id }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!textOnly && (
                <div className="bg-white rounded-2xl shadow-card p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800 mb-2">For the best print</p>
                  <ul className="space-y-1.5">
                    {[
                      "Use a bright, clear, high-resolution photo",
                      "Avoid screenshots and photos saved from social media",
                      design.clock ? "Keep faces away from the centre, where the hands sit" : "Keep faces away from the very edges of the frame",
                    ].map((t) => (
                      <li key={t} className="flex gap-2"><Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button size="lg" className="w-full rounded-2xl" disabled={!canContinue} onClick={goToSize}>
                Save &amp; Select Size <ArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-center text-xs text-gray-500 -mt-2">Next — choose size &amp; view in 3D</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* 3D preview */}
            <div className="lg:sticky lg:top-24">
              <div className="relative rounded-2xl bg-gradient-to-b from-[#efebe3] to-[#ddd6c7] aspect-square flex items-center justify-center overflow-hidden">
                {preview ? (
                  <Rotate3DPreview key={preview.url} src={preview.url} alt={`${design.name} preview`} size={420} autoSpin showControls={false} className="w-full" />
                ) : (
                  <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                )}
                <span className="absolute top-4 left-4 bg-white/90 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {sizeLabel(design, size)} in · {thickness}
                </span>
                <span className="absolute inset-x-0 bottom-4 text-center text-xs font-medium text-gray-500">
                  Drag to rotate in 3D
                </span>
              </div>
              <button
                onClick={() => setStep(1)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
              >
                <ArrowLeft className="w-4 h-4" /> Edit design
              </button>
            </div>

            {/* Options */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{design.name}</h1>
              {price && (
                <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mb-1">
                  <span className="text-3xl font-bold text-brand-700">{formatPrice(price.price)}</span>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(price.mrp)}</span>
                  <span className="text-sm font-semibold text-green-700">
                    {Math.round((1 - price.price / price.mrp) * 100)}% off
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500 mb-6">Inclusive of all taxes</p>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Size (Inch) <span className="font-normal text-gray-500">— {sizeLabel(design, size)}</span>
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {sizes.map((s) => {
                    const from = Math.min(...Object.values(s.prices).map((p) => p!.price));
                    return (
                      <button
                        key={s.id}
                        onClick={() => selectSize(s.id)}
                        className={cn(
                          "rounded-xl border-2 px-2 py-2 text-center transition-colors",
                          s.id === sizeId ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white hover:border-brand-300"
                        )}
                      >
                        <span className="block text-sm font-semibold text-gray-800">{sizeLabel(design, s)}</span>
                        <span className="block text-[11px] text-gray-500">from {formatPrice(from)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-800 mb-2">Thickness</p>
                <div className="grid grid-cols-3 gap-2">
                  {thicknesses.map((t) => {
                    const p = size.prices[t];
                    return (
                      <button
                        key={t}
                        disabled={!p}
                        onClick={() => setThickness(t)}
                        className={cn(
                          "rounded-xl border-2 px-2 py-2 text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                          t === thickness ? "border-brand-500 bg-brand-50" : "border-gray-200 bg-white hover:border-brand-300"
                        )}
                      >
                        <span className="block text-sm font-semibold text-gray-800">{t}</span>
                        <span className="block text-[11px] text-gray-500">{p ? formatPrice(p.price) : "N/A"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {quality && (
                <p
                  className={cn(
                    "text-xs rounded-lg px-3 py-2 mb-3 flex items-center gap-2",
                    quality.level === "great" && "bg-green-50 text-green-700",
                    quality.level === "ok" && "bg-amber-50 text-amber-700",
                    quality.level === "low" && "bg-red-50 text-red-700"
                  )}
                >
                  <Zap className="w-3.5 h-3.5 flex-shrink-0" /> {quality.text}
                </p>
              )}

              <div className="flex gap-3 text-sm text-gray-600 bg-white rounded-xl border border-gray-200 px-4 py-3 mb-6">
                {mounting.kind === "studs" ? (
                  <Hammer className="w-5 h-5 text-brand-500 flex-shrink-0" />
                ) : mounting.kind === "clock" ? (
                  <Clock className="w-5 h-5 text-brand-500 flex-shrink-0" />
                ) : (
                  <Sticker className="w-5 h-5 text-brand-500 flex-shrink-0" />
                )}
                <p>{mounting.text}</p>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
                  <Truck className="w-4 h-4 text-brand-500" /> Made in 1–3 working days, then shipped
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onKeyDown={(e) => e.key === "Enter" && checkPincode()}
                      inputMode="numeric"
                      placeholder="Enter pincode"
                      className="input pl-9 py-2"
                    />
                  </div>
                  <Button variant="secondary" size="sm" onClick={checkPincode} loading={checking}>Check</Button>
                </div>
                {estimate && (
                  <p className="text-xs text-green-700 mt-2">
                    Delivery to {estimate.region} by {estimate.earliestFormatted} – {estimate.latestFormatted}
                  </p>
                )}
              </div>

              {/* Quantity + actions */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1 border-2 border-gray-200 rounded-xl p-1 bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 rounded-2xl px-4"
                  disabled={!previewReady || !price || adding !== null}
                  loading={adding === "cart"}
                  onClick={() => handleAdd("cart")}
                >
                  <ShoppingCart className="w-5 h-5" /> Add to Cart
                </Button>
              </div>
              <Button
                size="lg"
                className="w-full rounded-2xl"
                disabled={!previewReady || !price || adding !== null}
                loading={adding === "buy"}
                onClick={() => handleAdd("buy")}
              >
                Buy Now — {formatPrice((price?.price ?? 0) * quantity)}
              </Button>
              {!textOnly && (
                <p className="text-center text-xs text-gray-500 mt-2">Your photos are uploaded securely when you add to cart.</p>
              )}
            </div>
          </div>
        )}

        <TrustStrip className="mt-10" />
        <ProductInfo line={line} />
      </div>
    </div>
  );
}

function ProductInfo({ line }: { line: ProductLine }) {
  return (
    <Tabs.Root defaultValue="description" className="mt-10 bg-white rounded-2xl shadow-card">
      <Tabs.List className="flex border-b border-gray-200 overflow-x-auto">
        {[
          { v: "description", l: "Description" },
          { v: "how", l: "How to order" },
          { v: "faq", l: "Questions" },
        ].map((t) => (
          <Tabs.Trigger
            key={t.v}
            value={t.v}
            className="px-5 py-3.5 text-sm font-semibold text-gray-500 border-b-2 border-transparent -mb-px whitespace-nowrap data-[state=active]:text-brand-700 data-[state=active]:border-brand-500"
          >
            {t.l}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value="description" className="p-5 sm:p-6 text-sm text-gray-600 leading-relaxed space-y-3">
        <p>{line.description}</p>
        <ul className="list-disc pl-5 space-y-1">
          {line.highlights.map((h) => <li key={h}>{h}</li>)}
        </ul>
      </Tabs.Content>

      <Tabs.Content value="how" className="p-5 sm:p-6">
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {line.howTo.map(([title, text], i) => (
            <li key={title} className="bg-cream-50 rounded-xl p-4">
              <span className="text-xs font-bold text-brand-600">STEP {i + 1}</span>
              <p className="font-semibold text-gray-800 mt-1">{title}</p>
              <p className="text-sm text-gray-600 mt-1">{text}</p>
            </li>
          ))}
        </ol>
      </Tabs.Content>

      <Tabs.Content value="faq" className="p-2 sm:p-3">
        <Accordion.Root type="single" collapsible>
          {line.faqs.map((f) => (
            <Accordion.Item key={f.q} value={f.q} className="border-b border-gray-100 last:border-0">
              <Accordion.Header>
                <Accordion.Trigger className="group w-full flex items-center justify-between gap-4 px-3 py-4 text-left text-sm font-semibold text-gray-800">
                  {f.q}
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-3 pb-4 text-sm text-gray-600 leading-relaxed">{f.a}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Tabs.Content>
    </Tabs.Root>
  );
}

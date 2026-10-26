"use client";
import { useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Move } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import type { Design } from "@/lib/designs";
import { clampPan, MAX_ZOOM, PanZoom, panCrop, RenderOptions, slotRects } from "@/lib/designs/render";
import type { Photo } from "@/store/photoStore";
import DesignCanvas from "./DesignCanvas";

interface PreviewEditorProps {
  design: Design;
  aspect: number;
  options: RenderOptions;
  /** Photo shown in each slot (after falling back to the main photo), or null */
  slotPhotos: (Photo | null)[];
  pans: PanZoom[];
  activeSlot: number;
  onSelectSlot: (slot: number) => void;
  onPan: (slot: number, pan: PanZoom) => void;
  onPickFile: (slot: number, file: File) => Promise<void>;
  className?: string;
}

/**
 * The live preview doubles as the editor: tap an empty spot to add a photo, drag a
 * photo to reposition it, and scroll / pinch (or use the slider) to zoom.
 */
export default function PreviewEditor({
  design, aspect, options, slotPhotos, pans, activeSlot, onSelectSlot, onPan, onPickFile, className,
}: PreviewEditorProps) {
  const rects = slotRects(design, aspect);

  return (
    <div className={cn("relative select-none", className)}>
      <DesignCanvas design={design} options={options} aspect={aspect} renderWidth={560} />
      {rects.map((rect, i) => (
        <SlotOverlay
          key={i}
          rect={rect}
          index={i}
          multi={rects.length > 1}
          active={i === activeSlot}
          photo={slotPhotos[i]}
          pan={pans[i]}
          slotAspect={(rect.width * aspect) / rect.height}
          onSelect={() => onSelectSlot(i)}
          onPan={(p) => onPan(i, p)}
          onPickFile={(f) => onPickFile(i, f)}
        />
      ))}
    </div>
  );
}

interface SlotOverlayProps {
  rect: { left: number; top: number; width: number; height: number };
  index: number;
  multi: boolean;
  active: boolean;
  photo: Photo | null;
  pan: PanZoom;
  slotAspect: number;
  onSelect: () => void;
  onPan: (pan: PanZoom) => void;
  onPickFile: (file: File) => Promise<void>;
}

function SlotOverlay({ rect, index, multi, active, photo, pan, slotAspect, onSelect, onPan, onPickFile }: SlotOverlayProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ pan: PanZoom; dist: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Latest values for the native wheel listener
  const latest = useRef({ pan, photo, slotAspect, onPan });
  latest.current = { pan, photo, slotAspect, onPan };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: async (files) => {
      const file = files[0];
      if (!file) return;
      setLoading(true);
      try {
        await onPickFile(file);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not read this photo");
      } finally {
        setLoading(false);
      }
    },
    onDropRejected: () => toast.error("Please choose a JPG, PNG or WEBP photo under 25 MB"),
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    maxSize: 25 * 1024 * 1024,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  const setPan = (next: PanZoom) => {
    if (!photo) return;
    onPan(clampPan(photo.image.naturalWidth, photo.image.naturalHeight, slotAspect, next));
  };

  // Wheel zoom needs a non-passive listener so the page doesn't scroll instead
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const { pan: p, photo: ph, slotAspect: a, onPan: set } = latest.current;
      if (!ph) return;
      e.preventDefault();
      const zoom = Math.min(MAX_ZOOM, Math.max(1, p.zoom * Math.exp(-e.deltaY * 0.0015)));
      set(clampPan(ph.image.naturalWidth, ph.image.naturalHeight, a, { ...p, zoom }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const distance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    onSelect();
    if (!photo) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current = { pan, dist: pointers.current.size === 2 ? distance() : 0 };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || !photo || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      // Pinch to zoom
      const ratio = distance() / (gesture.current.dist || 1);
      setPan({ ...gesture.current.pan, zoom: gesture.current.pan.zoom * ratio });
      return;
    }

    // Drag: convert screen px → image fraction using the visible crop size
    const box = e.currentTarget.getBoundingClientRect();
    const { naturalWidth: iw, naturalHeight: ih } = photo.image;
    const crop = panCrop(iw, ih, slotAspect, pan);
    const dx = ((e.clientX - prev.x) * (crop.width / box.width)) / iw;
    const dy = ((e.clientY - prev.y) * (crop.height / box.height)) / ih;
    setPan({ ...pan, cx: pan.cx - dx, cy: pan.cy - dy });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) {
      gesture.current = null;
      setDragging(false);
    } else {
      gesture.current = { pan, dist: pointers.current.size === 2 ? distance() : 0 };
    }
  };

  const style = {
    left: `${rect.left * 100}%`,
    top: `${rect.top * 100}%`,
    width: `${rect.width * 100}%`,
    height: `${rect.height * 100}%`,
  };

  return (
    <div
      {...getRootProps({
        ref,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerCancel: onPointerUp,
      })}
      style={style}
      className={cn(
        "absolute touch-none outline-none",
        photo ? (dragging ? "cursor-grabbing" : "cursor-grab") : "cursor-pointer",
        multi && active && "ring-2 ring-brand-500 ring-offset-0",
        isDragActive && "ring-4 ring-brand-400 bg-brand-500/10"
      )}
      aria-label={photo ? `Photo ${index + 1} — drag to adjust` : `Add photo ${index + 1}`}
    >
      <input {...getInputProps()} />
      {!photo && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
            open();
          }}
          className="absolute inset-0 m-auto h-fit w-fit max-w-[90%] flex flex-col items-center gap-1 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-gray-800 shadow-md hover:bg-white"
        >
          <ImagePlus className={cn("w-5 h-5 text-brand-600", loading && "animate-pulse")} />
          {multi ? `Add photo ${index + 1}` : "Upload photo"}
        </button>
      )}
      {photo && active && !dragging && (
        <span className="pointer-events-none absolute left-1/2 bottom-2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white whitespace-nowrap">
          <Move className="w-3 h-3" /> Drag to adjust
        </span>
      )}
      {photo && multi && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
            open();
          }}
          aria-label={`Replace photo ${index + 1}`}
          className={cn(
            "absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-gray-700 shadow hover:bg-white",
            !active && "opacity-0"
          )}
        >
          <ImagePlus className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

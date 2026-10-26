"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Design, designAspect } from "@/lib/designs";
import { loadCanvasFonts } from "@/lib/designs/fonts";
import { drawDesign, RenderOptions } from "@/lib/designs/render";

interface DesignCanvasProps {
  design: Design;
  options: RenderOptions;
  /** Defaults to the design's editor aspect */
  aspect?: number;
  /** Render width in CSS px; the canvas scales to fit its container */
  renderWidth?: number;
  className?: string;
}

/** Live, client-side render of a design — photos never leave the browser. */
export default function DesignCanvas({ design, options, aspect, renderWidth = 360, className }: DesignCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ratio = aspect ?? designAspect(design);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    if (!design.texts && !design.clock) return;
    let alive = true;
    loadCanvasFonts().then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, [design]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = renderWidth * dpr;
    drawDesign(canvas, design, options, w, w / ratio);
  }, [design, options, ratio, renderWidth, fontsReady]);

  return (
    <canvas
      ref={ref}
      className={cn("block w-full h-auto drop-shadow-[0_10px_18px_rgba(20,17,15,0.22)]", className)}
      style={{ aspectRatio: String(ratio) }}
      aria-label={`${design.name} preview`}
    />
  );
}

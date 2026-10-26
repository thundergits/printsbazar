"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Hand, RefreshCw, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Rotate3DPreviewProps {
  /** Any image URL — the baked PNG data URL from the customizer works as-is. */
  src: string;
  alt?: string;
  /** Maximum edge length of the sticker, in px — shrinks to fit a narrower container. */
  size?: number;
  /** Start spinning on its own (skipped when the visitor prefers reduced motion). */
  autoSpin?: boolean;
  /** Reset / auto-spin buttons + hint line. Turn off for compact inline previews. */
  showControls?: boolean;
  className?: string;
}

/** Resting pose — slightly turned so the preview reads as 3D before it is touched. */
const REST_X = -6;
const REST_Y = -14;
const MAX_TILT = 70;           // never let it flip end-over-end on the X axis
const FRICTION = 0.94;         // momentum damping per frame
const MIN_VELOCITY = 0.03;     // below this the spin has stopped
const MAX_VELOCITY = 14;       // deg per frame, keeps flings sane
const AUTO_SPIN_SPEED = 0.5;
const DRAG_SENSITIVITY = 0.45; // deg per px
const KEY_STEP = 12;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const normalize = (deg: number) => ((((deg + 180) % 360) + 360) % 360) - 180;

export default function Rotate3DPreview({
  src,
  alt = "Framed photo preview",
  size = 208,
  autoSpin = false,
  showControls = true,
  className,
}: Rotate3DPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef({ id: -1, x: 0, y: 0 });
  const motion = useRef({ rx: REST_X, ry: REST_Y, vx: 0, vy: 0, dragging: false, resetting: false });
  const autoSpinRef = useRef(false);
  const [spinning, setSpinning] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Breathing room so the sticker can grow toward the camera without clipping.
  const pad = showControls ? 56 : 18;
  const [box, setBox] = useState(size);

  // Shrink to fit whatever container the preview is dropped into.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const fit = () => setBox(Math.max(64, Math.min(size, el.clientWidth - pad)));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [size, pad]);

  // Thicker slab for bigger previews, so the edge stays visible at every scale.
  const thickness = Math.max(3, Math.round(box / 42));
  const depthLayers = useMemo(
    () => Array.from({ length: thickness * 2 - 1 }, (_, i) => -thickness + 1 + i),
    [thickness]
  );

  /** Clips a decorative layer to the silhouette of the frame (heart, circle, polaroid…). */
  const maskStyle = {
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  } as const;

  const apply = useCallback(() => {
    const m = motion.current;
    if (cardRef.current) {
      cardRef.current.style.transform = `rotateX(${m.rx.toFixed(2)}deg) rotateY(${m.ry.toFixed(2)}deg)`;
    }
    const rad = (m.ry * Math.PI) / 180;
    const facing = Math.abs(Math.cos(rad));
    if (shadowRef.current) {
      shadowRef.current.style.transform = `translateX(-50%) scaleX(${(0.5 + facing * 0.5).toFixed(3)})`;
      shadowRef.current.style.opacity = (0.12 + facing * 0.18).toFixed(3);
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = (Math.abs(Math.sin(rad)) * 0.5).toFixed(3);
      glareRef.current.style.backgroundPosition = `${clamp(50 + m.ry * 0.8, 0, 100).toFixed(1)}% 50%`;
    }
  }, []);

  const tick = useCallback(() => {
    const m = motion.current;
    if (m.resetting) {
      m.rx += (REST_X - m.rx) * 0.16;
      m.ry += (REST_Y - m.ry) * 0.16;
      if (Math.abs(m.rx - REST_X) < 0.15 && Math.abs(m.ry - REST_Y) < 0.15) {
        m.rx = REST_X;
        m.ry = REST_Y;
        m.resetting = false;
      }
    } else if (!m.dragging) {
      m.rx = clamp(m.rx + m.vx, -MAX_TILT, MAX_TILT);
      m.ry = normalize(m.ry + m.vy + (autoSpinRef.current ? AUTO_SPIN_SPEED : 0));
      m.vx *= FRICTION;
      m.vy *= FRICTION;
      if (Math.abs(m.vx) < MIN_VELOCITY) m.vx = 0;
      if (Math.abs(m.vy) < MIN_VELOCITY) m.vy = 0;
    }
    apply();

    const idle = !m.dragging && !m.resetting && !autoSpinRef.current && m.vx === 0 && m.vy === 0;
    rafRef.current = idle ? null : requestAnimationFrame(tick);
  }, [apply]);

  const startLoop = useCallback(() => {
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Paint the resting pose on mount, kick off the idle spin, and stop the loop
  // when the preview goes away.
  useEffect(() => {
    apply();
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (autoSpin && !reduced) {
      autoSpinRef.current = true;
      setSpinning(true);
      startLoop();
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [apply, autoSpin, startLoop]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current.id !== -1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    const m = motion.current;
    m.dragging = true;
    m.resetting = false;
    m.vx = 0;
    m.vy = 0;
    setDragging(true);
    startLoop();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current.id !== e.pointerId) return;
    const dx = e.clientX - pointerRef.current.x;
    const dy = e.clientY - pointerRef.current.y;
    pointerRef.current.x = e.clientX;
    pointerRef.current.y = e.clientY;

    const m = motion.current;
    m.ry = normalize(m.ry + dx * DRAG_SENSITIVITY);
    m.rx = clamp(m.rx - dy * DRAG_SENSITIVITY, -MAX_TILT, MAX_TILT);
    // Carry the last movement forward as momentum once the finger lifts.
    m.vy = clamp(dx * DRAG_SENSITIVITY, -MAX_VELOCITY, MAX_VELOCITY);
    m.vx = clamp(-dy * DRAG_SENSITIVITY, -MAX_VELOCITY, MAX_VELOCITY);
    apply();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current.id !== e.pointerId) return;
    pointerRef.current.id = -1;
    motion.current.dragging = false;
    setDragging(false);
    startLoop();
  };

  const reset = () => {
    autoSpinRef.current = false;
    setSpinning(false);
    const m = motion.current;
    m.vx = 0;
    m.vy = 0;
    m.resetting = true;
    startLoop();
  };

  const toggleAutoSpin = () => {
    const next = !autoSpinRef.current;
    autoSpinRef.current = next;
    setSpinning(next);
    if (next) motion.current.resetting = false;
    startLoop();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const m = motion.current;
    const nudge = (rx: number, ry: number) => {
      e.preventDefault();
      m.resetting = false;
      m.rx = clamp(m.rx + rx, -MAX_TILT, MAX_TILT);
      m.ry = normalize(m.ry + ry);
      apply();
    };
    if (e.key === "ArrowLeft") nudge(0, -KEY_STEP);
    else if (e.key === "ArrowRight") nudge(0, KEY_STEP);
    else if (e.key === "ArrowUp") nudge(-KEY_STEP, 0);
    else if (e.key === "ArrowDown") nudge(KEY_STEP, 0);
    else if (e.key.toLowerCase() === "r") reset();
  };

  return (
    <div ref={rootRef} className={cn("select-none", className)}>
      <div
        className="relative mx-auto flex items-center justify-center"
        style={{ width: box + pad, height: box + pad }}
      >
        {/* Ground shadow — flattens as the sticker turns edge-on */}
        <div
          ref={shadowRef}
          aria-hidden
          className="pointer-events-none absolute bottom-1 left-1/2 h-3 rounded-[50%] bg-gray-900 blur-md"
          style={{ width: box * 0.72, transform: "translateX(-50%)", opacity: 0.3 }}
        />

        {/* Perspective must sit on the card's direct parent, otherwise the rotation renders flat */}
        <div
          tabIndex={0}
          aria-label={`${alt}. Drag to rotate in 3D, arrow keys to rotate, R to reset.`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={reset}
          onKeyDown={handleKeyDown}
          className={cn(
            "touch-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2",
            dragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{ width: box, height: box, perspective: `${box * 4}px` }}
        >
          <div
            ref={cardRef}
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d", willChange: "transform" }}
          >
            {/* Material thickness — only visible once the sticker turns */}
            {depthLayers.map((z) => (
              <div
                key={z}
                aria-hidden
                className="absolute inset-0"
                style={{
                  ...maskStyle,
                  transform: `translateZ(${z}px)`,
                  backgroundImage: "linear-gradient(120deg, #b9ab9c 0%, #efe6db 45%, #cbbfb1 100%)",
                }}
              />
            ))}

            {/* Back — paper backing, keeps the silhouette of the frame */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                transform: `rotateY(180deg) translateZ(${thickness}px)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  ...maskStyle,
                  backgroundImage: "linear-gradient(135deg, #fffaf3 0%, #f3e8da 55%, #e6d8c7 100%)",
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                draggable={false}
                className="absolute inset-0 h-full w-full object-contain opacity-[0.08] grayscale"
                style={{ transform: "scaleX(-1)" }}
              />
            </div>

            {/* Front — the framed photo itself */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translateZ(${thickness}px)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt}
                draggable={false}
                className="h-full w-full object-contain"
              />
              {/* Sheen that sweeps across as the angle changes */}
              <div
                ref={glareRef}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  ...maskStyle,
                  backgroundImage:
                    "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.9) 48%, transparent 66%)",
                  backgroundSize: "250% 250%",
                  mixBlendMode: "overlay",
                  opacity: 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {showControls && (
        <>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={toggleAutoSpin}
              aria-pressed={spinning}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                spinning
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600"
              )}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", spinning && "animate-spin")} />
              {spinning ? "Spinning" : "Auto-spin"}
            </button>
          </div>

          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
            <Hand className="h-3.5 w-3.5 flex-shrink-0" />
            Drag the sticker to rotate it in 3D · double-tap to reset
          </p>
        </>
      )}
    </div>
  );
}

"use client";
import { useCallback, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Cropper, { Area, Point } from "react-easy-crop";
import { X, ZoomIn, ArrowLeft, ArrowRight, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Rotate3DPreview from "@/components/customizer/Rotate3DPreview";
import { cn } from "@/lib/utils";
import { FRAME_PRESETS, getFrame, heartClipPath } from "@/lib/frames";
import { bakeFramedImage, PixelCrop } from "@/lib/cropImage";

export interface CustomizerResult {
  imageDataUrl: string;
  frameId: string;
  crop: Point;
  zoom: number;
}

interface PhotoCustomizerProps {
  open: boolean;
  imageSrc: string;
  initial?: Partial<CustomizerResult>;
  onClose: () => void;
  onConfirm: (result: CustomizerResult) => void;
}

type Step = "frame" | "crop" | "preview";

export default function PhotoCustomizer({ open, imageSrc, initial, onClose, onConfirm }: PhotoCustomizerProps) {
  const [step, setStep] = useState<Step>("frame");
  const [frameId, setFrameId] = useState(initial?.frameId ?? FRAME_PRESETS[0].id);
  const [crop, setCrop] = useState<Point>(initial?.crop ?? { x: 0, y: 0 });
  const [zoom, setZoom] = useState(initial?.zoom ?? 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [baking, setBaking] = useState(false);

  const frame = getFrame(frameId);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleClose = () => {
    setStep("frame");
    onClose();
  };

  const handleApplyFrame = async () => {
    if (!croppedAreaPixels) return;
    setBaking(true);
    try {
      const dataUrl = await bakeFramedImage(imageSrc, croppedAreaPixels, frame);
      setPreviewUrl(dataUrl);
      setStep("preview");
    } finally {
      setBaking(false);
    }
  };

  const handleConfirm = () => {
    if (!previewUrl) return;
    onConfirm({ imageDataUrl: previewUrl, frameId, crop, zoom });
    setStep("frame");
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(92vw,32rem)] max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="font-display text-xl font-bold text-gray-800">
              Customize Your Photo
            </Dialog.Title>
            <Dialog.Close asChild>
              <button aria-label="Close" className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6 text-xs font-medium">
            {(["frame", "crop", "preview"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-5 h-px bg-gray-200" />}
                <div className={cn(
                  "px-2.5 py-1 rounded-full capitalize",
                  step === s ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  {s === "frame" ? "1. Frame" : s === "crop" ? "2. Crop & Position" : "3. Preview"}
                </div>
              </div>
            ))}
          </div>

          {step === "frame" && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {FRAME_PRESETS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFrameId(f.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all",
                      frameId === f.id ? "border-brand-500 bg-brand-50" : "border-transparent hover:bg-cream-100"
                    )}
                  >
                    <div className="relative w-16 h-16">
                      {f.isHeart ? (
                        <div
                          className="w-full h-full bg-maroon-500"
                          style={{ clipPath: heartClipPath() }}
                        >
                          <div
                            className="w-full h-full bg-cream-200 bg-cover bg-center"
                            style={{
                              clipPath: heartClipPath(),
                              backgroundImage: `url(${imageSrc})`,
                              margin: "12%",
                              width: "76%",
                              height: "76%",
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          className={cn("w-full h-full bg-cover bg-center", f.previewBorderClassName)}
                          style={{ backgroundImage: `url(${imageSrc})` }}
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium text-gray-600">{f.name}</span>
                  </button>
                ))}
              </div>
              <Button className="w-full rounded-2xl" onClick={() => setStep("crop")}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {step === "crop" && (
            <>
              <div className="relative w-full h-80 bg-gray-100 rounded-2xl overflow-hidden mb-4">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={frame.aspect}
                  cropShape={frame.cropShape}
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>
              <p className="text-xs text-gray-400 text-center mb-4">Drag the photo to reposition it inside the frame.</p>
              <div className="flex gap-3">
                <Button variant="secondary" className="rounded-2xl" onClick={() => setStep("frame")}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button className="flex-1 rounded-2xl" onClick={handleApplyFrame} loading={baking}>
                  Apply Frame
                </Button>
              </div>
            </>
          )}

          {step === "preview" && previewUrl && (
            <>
              <Rotate3DPreview
                src={previewUrl}
                alt="Framed preview"
                size={200}
                autoSpin
                className="mb-6"
              />
              <div className="flex gap-3">
                <Button variant="secondary" className="rounded-2xl" onClick={() => setStep("crop")}>
                  <ArrowLeft className="w-4 h-4" /> Re-crop
                </Button>
                <Button className="flex-1 rounded-2xl" onClick={handleConfirm}>
                  <Check className="w-4 h-4" /> Use This Photo
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

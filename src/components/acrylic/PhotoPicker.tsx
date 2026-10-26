"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { usePhotoStore } from "@/store/photoStore";

interface PhotoPickerProps {
  /** "dropzone" = large drag & drop area, "button" = compact change-photo button */
  variant?: "dropzone" | "button";
  label?: string;
  /** Which photo slot the chosen photo fills (collage designs have several) */
  slot?: number;
  className?: string;
}

export default function PhotoPicker({ variant = "dropzone", label, slot = 0, className }: PhotoPickerProps) {
  const setPhoto = usePhotoStore((s) => s.setPhoto);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setLoading(true);
      try {
        await setPhoto(slot, file);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not read this photo");
      } finally {
        setLoading(false);
      }
    },
    [setPhoto, slot]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors[0]?.code;
      toast.error(code === "file-too-large" ? "Photo is larger than 25 MB" : "Please choose a JPG, PNG or WEBP photo");
    },
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
    maxSize: 25 * 1024 * 1024,
    multiple: false,
  });

  if (variant === "button") {
    return (
      <div {...getRootProps()} className={className}>
        <input {...getInputProps()} />
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-medium text-gray-700 hover:border-brand-400 hover:text-brand-700 transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          {label ?? "Change photo"}
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
        isDragActive ? "border-brand-500 bg-brand-50" : "border-gray-300 bg-white hover:border-brand-400 hover:bg-cream-100",
        className
      )}
    >
      <input {...getInputProps()} />
      <ImagePlus className={cn("w-9 h-9 text-brand-500 mx-auto mb-3", loading && "animate-pulse")} />
      <p className="font-semibold text-gray-800 mb-1">
        {isDragActive ? "Drop your photo here" : label ?? "Select a photo"}
      </p>
      <p className="text-sm text-gray-500">JPG, PNG or WEBP · it stays on your device until you order</p>
    </div>
  );
}

import { create } from "zustand";
import { loadImage } from "@/lib/designs/render";

export interface Photo {
  file: File;
  url: string;
  image: HTMLImageElement;
}

// The customer's photos, kept in memory only so they follow them from the design
// gallery into the editor. Nothing is uploaded until they add the item to cart.
// Slot 0 is the photo picked in the gallery; collage slots without their own photo
// fall back to it.
interface PhotoStore {
  photos: (Photo | null)[];
  setPhoto: (slot: number, file: File) => Promise<void>;
  clear: () => void;
}

export const usePhotoStore = create<PhotoStore>()((set, get) => ({
  photos: [],

  setPhoto: async (slot, file) => {
    const url = URL.createObjectURL(file);
    let image: HTMLImageElement;
    try {
      image = await loadImage(url);
    } catch {
      URL.revokeObjectURL(url);
      throw new Error("Could not read this photo. Please use a JPG, PNG or WEBP image.");
    }
    const photos = [...get().photos];
    const prev = photos[slot];
    if (prev) URL.revokeObjectURL(prev.url);
    photos[slot] = { file, url, image };
    set({ photos });
  },

  clear: () => {
    get().photos.forEach((p) => p && URL.revokeObjectURL(p.url));
    set({ photos: [] });
  },
}));

export function photoForSlot(photos: (Photo | null)[], slot: number): Photo | null {
  return photos[slot] ?? photos[0] ?? null;
}

/** Minimum pixels on the short side we accept for printing (mirrors /api/upload) */
export const MIN_PHOTO_PX = 800;

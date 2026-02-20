
import toast from 'react-hot-toast';
import { supabase } from '../supabase/supabase';
import { createSyncStoragePersister } from './../../node_modules/@tanstack/query-sync-storage-persister/src/index';
import type { CategoryKey } from '../constant/data';
export const storagePersister = createSyncStoragePersister({
  storage: window.localStorage,
});


// For Video Deleting
export const handleAutoDeletedVideo = (
  userId: any,
  videoId: any,
  fileName: any,
  fetchUserVideos: () => Promise<void>,
  delay: number = 7 * 24 * 60 * 60 * 1000,
  setIsDeleteMedia: any
) => {
  setTimeout(async () => {
    try {
      // 1️⃣ Delete from Supabase Storage
      const { error: removeError } = await supabase.storage
        .from("media")
        .remove([`video/${fileName}`]);

      if (removeError) {
        console.error("❌ Error deleting file:", removeError.message);
        return;
      }

      // 2️⃣ Remove from User DB record
      const { data: userData, error: fetchError } = await supabase
        .from("Users")
        .select("video")
        .eq("auth_id", userId)
        .single();

      if (fetchError || !userData?.video) {
        console.error("⚠️ User not found or no videos:", fetchError);
        return;
      }

      const updatedVideos = userData.video.filter((v: any) => v.id !== videoId);
      const { error: updateError } = await supabase
        .from("Users")
        .update({ video: updatedVideos })
        .eq("auth_id", userId);

      if (updateError) {
        console.error("❌ Failed to update user videos:", updateError.message);
      } else {
        setIsDeleteMedia("⏱️ Your video was automatically deleted after the set time!")
        await fetchUserVideos();
      }
    } catch (err) {
      console.error("❌ Auto-delete failed:", err);
    }
  }, delay);
};

// For Audio Deleting
export const handleAutoDeletedAudio = (
  userId: any,
  audioId: string,
  fileName: string,
  fetchUserAudios: () => Promise<void>,
  delay: number = 7 * 24 * 60 * 60 * 1000,
  setIsDeleteMedia: any
) => {
  setTimeout(async () => {
    try {
      // 1️⃣ Delete from Supabase Storage
      const { error: removeError } = await supabase.storage
        .from("media")
        .remove([`video/${fileName}`]);

      if (removeError) {
        console.error("❌ Error deleting file:", removeError.message);
        return;
      }

      // 2️⃣ Remove from User DB record
      const { data: userData, error: fetchError } = await supabase
        .from("Users")
        .select("video")
        .eq("auth_id", userId)
        .single();

      if (fetchError || !userData?.video) {
        console.error("⚠️ User not found or no videos:", fetchError);
        return;
      }

      const updatedVideos = userData.video.filter((v: any) => v.id !== audioId);
      const { error: updateError } = await supabase
        .from("Users")
        .update({ video: updatedVideos })
        .eq("auth_id", userId);

      if (updateError) {
        console.error("❌ Failed to update user videos:", updateError.message);
      } else {
        setIsDeleteMedia("⏱️ Your video was automatically deleted after the set time!")
        await fetchUserAudios();
      }
    } catch (err) {
      console.error("❌ Auto-delete failed:", err);
    }
  }, delay);
};

// for Image deleting
export const handleAutoDeletedImage = (
  userId: any,
  imageId: any,
  fileName: any,
  fetchUserImages: () => Promise<void>,
  delay: number = 7 * 24 * 60 * 60 * 1000
) => {
  setTimeout(async () => {
    try {
      // 1️⃣ Remove from Supabase Storage
      const { error: removeError } = await supabase.storage
        .from("user-images")
        .remove([fileName]);

      if (removeError) {
        console.error("❌ Error deleting image:", removeError.message);
        return;
      }

      // 2️⃣ Remove from Users table
      const { data: userData, error: fetchError } = await supabase
        .from("Users")
        .select("images")
        .eq("auth_id", userId)
        .single();

      if (fetchError || !userData?.images) {
        console.error("⚠️ No user images found:", fetchError);
        return;
      }

      const updatedImages = userData.images.filter(
        (img: any) => img.id !== imageId
      );

      const { error: updateError } = await supabase
        .from("Users")
        .update({ images: updatedImages })
        .eq("auth_id", userId);

      if (updateError) {
        console.error("❌ Failed to update user DB:", updateError.message);
        return;
      }

      // 3️⃣ Notify user & refresh UI
      alert('deleted all video')
      toast.success("Auto-deleted old image!");
      await fetchUserImages();
    } catch (err) {
      console.error("Auto-delete image failed:", err);
    }
  }, delay);
};


// Card Size Control
export const mmToPx = (mm: number) => (mm / 25.4) * 96;
export const uuid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;

// For Admin & Preview
export function fitCanvas(mmW: number, mmH: number, viewportW: number, viewportH: number, padding = 32) {
  const pxW = mmToPx(mmW), pxH = mmToPx(mmH);
  const maxW = Math.max(280, viewportW - padding);
  const maxH = Math.max(220, viewportH - padding);
  const scale = Math.min(maxW / pxW, maxH / pxH);
  return { width: Math.round(pxW * scale), height: Math.round(pxH * scale), scale };
}

// For User Editor & preview
export function coverScale(baseW: number, baseH: number, boxW: number, boxH: number) {
  const scale = Math.max(boxW / baseW, boxH / baseH); // ✅ cover
  const w = baseW * scale;
  const h = baseH * scale;
  const offsetX = (boxW - w) / 2;
  const offsetY = (boxH - h) / 2;
  return { scale, w, h, offsetX, offsetY };
}


export const preservePdfItems = (prev: any[], next: any[]) => {
  const prevPdf = (prev ?? []).filter((i) => i?.source === "pdf");
  const nextNoPdf = (next ?? []).filter((i) => i?.source !== "pdf");

  const nextIds = new Set(nextNoPdf.map((i) => i?.id));
  const keepPdf = prevPdf.filter((p) => p?.id && !nextIds.has(p.id));

  return [...nextNoPdf, ...keepPdf];
};

// canvasMultiplier.ts
export const FOUR_X_CATEGORIES: Record<any, number> = {
  "Business Cards": 5.5,
  "Coasters": 4.5,
  "Mugs": 4,
};

export const getCanvasMultiplier = (category: CategoryKey | string) =>
  FOUR_X_CATEGORIES[category as any] ?? 2;



export async function removeWhiteBg(
  imgUrl: string,
  opts?: {
    threshold?: number;
    alphaThreshold?: number;
    minBrightness?: number;
    satThreshold?: number;
    mode?: "edge" | "all";
  }
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      const width = canvas.width;
      const height = canvas.height;
      if (!width || !height) {
        resolve(imgUrl);
        return;
      }

      const threshold = opts?.threshold ?? 26;
      const alphaThreshold = opts?.alphaThreshold ?? 8;
      const minBrightness = opts?.minBrightness ?? 230;
      const satThreshold = opts?.satThreshold ?? 18;

      const getPixel = (x: number, y: number) => {
        const i = (y * width + x) * 4;
        return [data[i], data[i + 1], data[i + 2], data[i + 3]] as const;
      };

      const avgColor = (points: Array<[number, number]>) => {
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        points.forEach(([x, y]) => {
          const xx = Math.max(0, Math.min(width - 1, x));
          const yy = Math.max(0, Math.min(height - 1, y));
          const [pr, pg, pb] = getPixel(xx, yy);
          r += pr;
          g += pg;
          b += pb;
          count += 1;
        });
        if (!count) return [255, 255, 255] as const;
        return [Math.round(r / count), Math.round(g / count), Math.round(b / count)] as const;
      };

      const bg = avgColor([
        [0, 0],
        [width - 1, 0],
        [0, height - 1],
        [width - 1, height - 1],
        [Math.floor(width / 2), 0],
        [Math.floor(width / 2), height - 1],
        [0, Math.floor(height / 2)],
        [width - 1, Math.floor(height / 2)],
      ]);

      const isBg = (r: number, g: number, b: number, a: number) => {
        if (a <= alphaThreshold) return true;
        const maxc = Math.max(r, g, b);
        const minc = Math.min(r, g, b);
        const brightness = (r + g + b) / 3;
        const sat = maxc - minc;
        const diff = Math.max(Math.abs(r - bg[0]), Math.abs(g - bg[1]), Math.abs(b - bg[2]));
        return (diff <= threshold && sat <= satThreshold) || (brightness >= minBrightness && sat <= satThreshold);
      };

      const mode = opts?.mode ?? "edge";

      if (mode === "all") {
        for (let i = 0; i < data.length; i += 4) {
          if (isBg(data[i], data[i + 1], data[i + 2], data[i + 3])) {
            data[i + 3] = 0;
          }
        }
      } else {
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        const pushIfBg = (x: number, y: number) => {
          if (x < 0 || y < 0 || x >= width || y >= height) return;
          const idx = y * width + x;
          if (visited[idx]) return;
          const i = idx * 4;
          if (!isBg(data[i], data[i + 1], data[i + 2], data[i + 3])) return;
          visited[idx] = 1;
          queue.push(idx);
        };

        // seed edges
        for (let x = 0; x < width; x += 1) {
          pushIfBg(x, 0);
          pushIfBg(x, height - 1);
        }
        for (let y = 0; y < height; y += 1) {
          pushIfBg(0, y);
          pushIfBg(width - 1, y);
        }

        // flood fill background connected to edges
        for (let qi = 0; qi < queue.length; qi += 1) {
          const idx = queue[qi];
          const x = idx % width;
          const y = Math.floor(idx / width);

          const i = idx * 4;
          data[i + 3] = 0; // transparent

          pushIfBg(x + 1, y);
          pushIfBg(x - 1, y);
          pushIfBg(x, y + 1);
          pushIfBg(x, y - 1);
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(imgUrl);
  });
}

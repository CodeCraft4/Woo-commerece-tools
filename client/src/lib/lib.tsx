
import toast from 'react-hot-toast';
import { supabase } from '../supabase/supabase';
import { createSyncStoragePersister } from './../../node_modules/@tanstack/query-sync-storage-persister/src/index';
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




import { supabase } from "../supabase/supabase";

export const uploadVideoToSupabase = async (file: File): Promise<string | null> => {
  if (file.type !== "video/mp4") {
    alert("Only MP4 videos are allowed.");
    return null;
  }

  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("media")
    .upload(`videos/${fileName}`, file);

  if (error) {
    console.error("Upload error:", error.message);
    alert("Failed to upload video");
    return null;
  }

  const { data } = supabase.storage
    .from("media")
    .getPublicUrl(`videos/${fileName}`);

  return data.publicUrl;
};

// For Video
export const fetchVideoLatestMedia = async (setMediaUrl:any) => {
      const { data, error } = await supabase.storage
        .from("media")
        .list("video", {
          limit: 1,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.error("Error fetching media:", error.message);
        return;
      }

      if (data && data.length > 0) {
        const latestFile = data[0].name;

        // ✅ match upload path "video/filename"
        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(`video/${latestFile}`);

        console.log("Latest video public URL:", urlData.publicUrl);
        setMediaUrl(urlData.publicUrl);
      } else {
        console.warn("No video files found in bucket");
      }
    };

    // For Audio
export const fetchAudioLatestMedia = async (setAudioUrl:any) => {
      const { data, error } = await supabase.storage
        .from("media")
        .list("audio", {
          limit: 1,
          sortBy: { column: "created_at", order: "desc" },
        });

      if (error) {
        console.error("Error fetching media:", error.message);
        return;
      }

      if (data && data.length > 0) {
        const latestFile = data[0].name;

        // ✅ match upload path "video/filename"
        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(`audio/${latestFile}`);

        console.log("Latest video public URL:", urlData.publicUrl);
        setAudioUrl(urlData.publicUrl);
      } else {
        console.warn("No video files found in bucket");
      }
    };
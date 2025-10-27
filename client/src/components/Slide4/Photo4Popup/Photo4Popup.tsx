import { Box, Typography, IconButton } from "@mui/material";
import { ControlPoint, Delete, Check } from "@mui/icons-material";
import PopupWrapper from "../../PopupWrapper/PopupWrapper";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/supabase";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import { COLORS } from "../../../constant/color";
import { useSlide4 } from "../../../context/Slide4Context";

interface Photo4PopupProps {
  onClose: () => void;
  activeIndex?: number;
}

const Photo4Popup = ({ onClose }: Photo4PopupProps) => {
  const {
    images4,
    setSelectedImage4,
    selectedImg4,
    setImages4,
    setDraggableImages4,
  } = useSlide4();

  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const generateId: any = () => Date.now() + Math.random();

  const uploadToSupabase = async (file: File, fileName: string) => {
    setLoading(true);

    try {
      const { error } = await supabase.storage
        .from("user-images")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error.message);
        toast.error(`Upload failed: ${error.message}`);
        setLoading(false);
        return null;
      }

      const { data } = supabase.storage
        .from("user-images")
        .getPublicUrl(fileName);

      setLoading(false);
      toast.success("✅ Photo uploaded successfully!");
      return data.publicUrl;
    } catch (err: any) {
      console.error("Unexpected upload error:", err);
      toast.error("Unexpected error while uploading.");
      setLoading(false);
      return null;
    }
  };

  // ✅ Save image URL to the user's images array in DB (only id and url)
  const saveImageUrlToDB = async (imageId: string, imageUrl: string) => {
    if (!user?.id) {
      toast.error("No authenticated user found!");
      return;
    }

    try {
      const { data: userData, error: fetchError } = await supabase
        .from("Users")
        .select("images")
        .eq("auth_id", user.id)
        .single();

      if (fetchError) {
        console.error("Error fetching user data:", fetchError);
        toast.error("Failed to fetch user data.");
        return;
      }

      const newImage = { id: imageId, url: imageUrl };
      const updatedImages = userData?.images
        ? [...userData.images, newImage]
        : [newImage];

      const { error: updateError } = await supabase
        .from("Users")
        .update({ images: updatedImages })
        .eq("auth_id", user.id);

      if (updateError) {
        console.error("Error updating user images:", updateError);
        toast.error("Failed to save image URL.");
        return;
      }

      toast.success("✅ Image saved to your account!");
    } catch (err) {
      console.error("Error saving image to DB:", err);
      toast.error("Database save failed.");
    }
  };

  const handleFileChange = async (e: any) => {
    const files: any = Array.from(e.target.files);

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const imageId = generateId().toString(); // Generate unique ID
      const fileName = `${imageId}.${fileExt}`;

      const url = await uploadToSupabase(file, fileName);

      if (url) {
        // Store in local state with fileName for deletion
        setImages4((prev: any) => [
          ...prev,
          { id: imageId, src: url, fileName },
        ]);

        // Save to DB with only id and url
        await saveImageUrlToDB(imageId, url);
      }
    }

    e.target.value = null;
  };

  const handleDelete = async (id: any) => {
    const imgToDelete: any = images4.find((img) => img.id === id);
    if (!imgToDelete) return;

    try {
      await supabase.storage.from("user-images").remove([imgToDelete.fileName]);

      if (user?.id) {
        const { data: userData, error: fetchError } = await supabase
          .from("Users")
          .select("images")
          .eq("auth_id", user.id)
          .single();

        if (!fetchError && userData?.images) {
          const updatedImages = userData.images.filter(
            (img: any) => img.id !== id
          );

          await supabase
            .from("Users")
            .update({ images: updatedImages })
            .eq("auth_id", user.id);
        }
      }

      setImages4((prev) => prev.filter((img) => img.id !== id));
      toast.success("🗑️ Photo deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete photo!");
    }
  };

  // 🔹 Fetch all images from Supabase when user is available
  const fetchUserImages = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("Users")
        .select("images")
        .eq("auth_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user images:", error);
        return;
      }

      if (data?.images && Array.isArray(data.images)) {
        // Map to your component's local structure
        const formattedImages = data.images.map((img: any) => ({
          id: img.id,
          src: img.url, // rename url → src for consistency
        }));

        setImages4(formattedImages);
      } else {
        console.log("No images found for this user.");
        setImages4([]); // clear if none
      }
    } catch (err) {
      console.error("Unexpected error fetching images:", err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        await fetchUserImages(); // ✅ await allowed here
      } catch (error) {
        console.error("❌ Error fetching user images:", error);
      }
    };

    fetchData();
  }, [user, images4]);

  return (
    <PopupWrapper
      title="Photos"
      onClose={onClose}
      sx={{
        width: { md: 350, sm: 350, xs: "95%" },
        height: 600,
        left: { md: "53%", sm: "53%", xs: 10 },
        mt: { md: 0, sm: 0, xs: 4 },
        zIndex: 99,
      }}
    >
      <Typography
        sx={{
          color: "#414141ff",
          textAlign: "start",
          fontSize: "15px",
          fontFamily: "sans-serif",
          mb: 2,
        }}
      >
        You can upload any .png .jpeg or .heic file.
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          overflow: "auto",
          height: "auto",
          "&::-webkit-scrollbar": {
            height: "6px",
            width: "5px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
            borderRadius: "20px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: COLORS.primary,
            borderRadius: "20px",
          },
        }}
      >
        <Box
          component="input"
          type="file"
          accept="image/png, image/jpeg, image/heic"
          sx={{
            position: "absolute",
            width: "115px",
            height: "115px",
            bgcolor: "red",
            opacity: 0,
            cursor: "pointer",
            top: 100,
            left: 20,
            zIndex: 10,
          }}
          onChange={handleFileChange}
          multiple
        />

        {/* Upload box */}
        <Box
          sx={{
            width: "115px",
            height: "115px",
            borderRadius: "5px",
            border: `2px solid ${loading ? "#85584ff" : "#4a7bd5"} `,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            userSelect: "none",
            pointerEvents: "none",
            color: "#4a7bd5",
            fontWeight: "bold",
            flexDirection: "column",
            fontSize: loading ? "14px" : "20px",
            p: 2,
          }}
        >
          <ControlPoint fontSize="large" />
          {loading ? "Uploading..." : "Add Photo"}
        </Box>

        {/* Uploaded images */}
        {images4.map(({ id, src }) => (
          <Box
            key={id}
            onClick={() =>
              setSelectedImage4((prev: any) => {
                const isSelected = prev.includes(id);
                // Increment zIndex only if selecting a new image
                setDraggableImages4((imgs: any[]) =>
                  imgs.map((img) =>
                    img.id === id
                      ? {
                          ...img,
                          zIndex: !isSelected
                            ? Math.max(...imgs.map((i) => i.zIndex || 0)) + 1
                            : img.zIndex, // keep current zIndex when unselecting
                        }
                      : img
                  )
                );

                const updated = isSelected
                  ? prev.filter((i: any) => i !== id)
                  : [...prev, id];
                return updated;
              })
            }
            sx={{
              width: 115,
              height: 115,
              border: `2px solid ${
                selectedImg4?.includes(id) ? "#4a7bd5" : "#bd7082ff"
              }`,
              borderRadius: 2,
              position: "relative",
              cursor: "pointer",
              overflow: "hidden",
              transition: "border 0.2s ease",
              "&:hover": {
                border: "2px solid #d44767",
              },
            }}
          >
            <Box
              component="img"
              src={src}
              alt="Uploaded"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 1.6,
              }}
            />

            {/* Delete Button */}
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(id);
              }}
              sx={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "#f0f1f4",
                "&:hover": { bgcolor: "#e5e6e8" },
                zIndex: 99,
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
              size="small"
              aria-label="Delete uploaded image"
            >
              <Delete
                fontSize="small"
                sx={{
                  color: "black",
                  "&:hover": { color: "red" },
                  fontSize: 15,
                }}
              />
            </IconButton>

            {/* Selected Check Icon */}
            {selectedImg4?.includes(id) && (
              <IconButton
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: "#4a7bd5",
                  color: "white",
                  border: "2px solid white",
                  width: 24,
                  height: 24,
                  zIndex: 99,
                  "&:hover": { bgcolor: "#456fcf" },
                }}
                size="small"
                aria-label="Selected image"
              >
                <Check sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>
    </PopupWrapper>
  );
};

export default Photo4Popup;

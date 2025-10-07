import { Box, Typography, IconButton } from "@mui/material";
import { ControlPoint, Delete, Check } from "@mui/icons-material";
import PopupWrapper from "../PopupWrapper/PopupWrapper";
import { useWishCard } from "../../context/WishCardContext";

// interface ImageType {
//   id: number | string;
//   src: string;
// }

interface PhotoPopupProps {
  onClose: () => void;
}

const PhotoPopup = ({
  onClose,
}: PhotoPopupProps) => {

  const {images,setSelectedImage,selectedImg,setImages,}= useWishCard()

  const generateId: any = () => Date.now() + Math.random();

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        setImages((prev: any) => [
          ...prev,
          { id: generateId(), src: ev.target.result },
        ]);
      };
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };
  // Delete image by id
  const handleDelete = (id: any) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSelectedImg = (id: any) => {
    setSelectedImage((prev) => (prev === id ? null : id));
  };

  return (
    <PopupWrapper title="Photos" onClose={onClose} sx={{ width: 300, height: 600, left: "12%", zIndex: 99 }}>
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

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box
          component="input"
          type="file"
          accept="image/png, image/jpeg, image/heic"
          sx={{
            position: "absolute",
            width: "125px",
            height: "125px",
            opacity: 0,
            cursor: "pointer",
            top: 150,
            left: 20,
            zIndex: 10,
          }}
          onChange={handleFileChange}
          multiple
        />

        {/* Upload box */}
        <Box
          sx={{
            width: "125px",
            height: "125px",
            borderRadius: "5px",
            border: "2px solid #3a7bd5",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            userSelect: "none",
            pointerEvents: "none",
            color: "#3a7bd5",
            fontWeight: "bold",
            flexDirection: "column",
            fontSize: "20px",
            p: 2,
          }}
        >
          <ControlPoint fontSize="large" />
          Add Photo
        </Box>

        {/* Uploaded images */}
        {images.map(({ id, src }) => (
          <Box
            key={id}
            sx={{
              width: "125px",
              height: "125px",
              border: selectedImg === id ? "2px solid #3a7bd5" : "2px solid transparent",
              borderRadius: 2,
              position: "relative",
              cursor: "pointer",
              "&:hover": {
                border: "2px solid #d34767",
              },
            }}
            onClick={() => setSelectedImage(id)}
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
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(id);
              }}
              sx={{
                position: "absolute",
                bottom: -15,
                left: "40%",
                bgcolor: "#f0f1f3",
                "&:hover": { bgcolor: "#f0f1f3" },
                zIndex: 99,
              }}
              size="small"
              aria-label="Delete uploaded image"
            >
              <Delete sx={{ color: "#212121", "&:hover": { color: "#ce3356" } }} />
            </IconButton>

            {selectedImg === id && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectedImg(id);
                }}
                sx={{
                  position: "absolute",
                  bottom: 3,
                  right: 3,
                  bgcolor: "#3a7bd5",
                  zIndex: 99,
                  border: "2px solid white",
                  width: "20px",
                  height: "20px",
                }}
                size="small"
                aria-label="Selected image"
              >
                <Check sx={{ color: "white", fontSize: "16px" }} />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>
    </PopupWrapper>
  );
};

export default PhotoPopup;
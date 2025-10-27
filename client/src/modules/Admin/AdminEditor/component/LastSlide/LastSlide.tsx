import { Box, Typography, TextField } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import { useRef, useState } from "react";
import LandingButton from "../../../../../components/LandingButton/LandingButton";

const LastSlide = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log("Image loaded:", reader.result);
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography sx={{ fontSize: "25px" }}>Last Slide</Typography>
        <LandingButton
          title="Save Changes"
          // onClick={() => navigate(ADMINS_DASHBOARD.ADD_NEW_CARDS)}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: { md: "700px", sm: "700px", xs: 400 },
        }}
      >
        <Box
          sx={{
            width: "550px",
            boxShadow: "3px 8px 9px gray",
            borderRadius: "12px",
            border: "1px solid lightgray",
            height: "100%",
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            position: "relative",
          }}
        >
          {/* Image Upload Section */}
          <Box
            sx={{
              width: "100%",
              height: "30%",
              borderRadius: "12px",
              backgroundColor: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            {uploadedImage ? (
              <Box
                component="img"
                src={uploadedImage}
                alt="Uploaded"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <Box sx={{ textAlign: "center", color: "#888" }}>
                <ImageIcon sx={{ fontSize: 80, color: "#bbb" }} />
                <Typography>Upload Image</Typography>
              </Box>
            )}
          </Box>

          {/* Editable Text Field */}
          <Box sx={{ width: "100%", mt: 2 }}>
            <TextField
              placeholder="Enter you Details"
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LastSlide;

import {
  Box,
  LinearProgress,
  Typography,
} from "@mui/material";
import CustomInput from "../../../../components/CustomInput/CustomInput";
import LandingButton from "../../../../components/LandingButton/LandingButton";
import { useState } from "react";

const NewCardsForm = () => {
  const [image, setImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (file: File) => {
    setLoading(true);
    setProgress(0);

    // fake upload simulation
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);

          // once "uploaded", show preview
          const reader = new FileReader();
          reader.onloadend = () => {
            setImage(reader.result as string);
            setLoading(false);
          };
          reader.readAsDataURL(file);

          return 100;
        }
        return old + 10;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  return (
    <Box sx={{ px: 3 }}>
      <Box
        sx={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          width: "100%",
          height: "86vh",
          overflow: "hidden",
          mt: 2,
        }}
      >
        {/* LEFT BOX (Image Upload) */}
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            width: { md: "50%" },
            border: "1px solid lightGray",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            cursor: "pointer",
            bgcolor: "#eeedecff",
          }}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          {/* Hidden file input */}
          <input
            type="file"
            id="fileInput"
            hidden
            accept="image/*"
            onChange={handleFileSelect}
          />

          {loading ? (
            <Box sx={{ width: "80%" }}>
              <Typography sx={{ mb: 1, fontSize: 14, color: "orange" }}>
                Uploading... {progress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: "#ffe0b2",
                  "& .MuiLinearProgress-bar": { backgroundColor: "orange" },
                }}
              />
            </Box>
          ) : image ? (
            <Box
              component="img"
              src={image}
              alt="Uploaded"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                m: "auto",
                alignItems:'center',
              }}
            >
              <Box
                component={"img"}
                src="/assets/icons/gallery.png"
                sx={{ width: 150, height: 150 }}
              />
              <Typography sx={{ color: "gray", fontSize: 16 }}>
                Drag & Drop or Click to Upload
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ width: { md: "50%" } }}>
          <CustomInput label="Card Name" placeholder="Enter your card name" />
          <CustomInput
            label="Card Category"
            placeholder="Enter your category"
          />
          <CustomInput label="SKU" placeholder="Enter your SKU" />
          <CustomInput
            label="Actual Price "
            placeholder="Enter your actual price"
          />
          <CustomInput label="Sale Price" placeholder="Enter your sale price" />
          <CustomInput
            label="Card description"
            placeholder="Enter your description"
            multiline
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              mt: 2,
            }}
          >
            <LandingButton
              title="Save & Publish"
              personal
              variant="outlined"
              width="250px"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default NewCardsForm;

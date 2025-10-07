// SlideLogo.tsx
import { Box, Typography, TextField } from "@mui/material";
import { useState, useRef } from "react";

const SlideLogo = () => {
  const [logoSrc, setLogoSrc] = useState("/assets/images/blackLOGO.png");
  const [description, setDescription] = useState(
    "I accept the Terms & Conditions and give my consent to proceed with the order."
  );
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 4. Handler to update logoSrc when a file is selected
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        bgcolor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        fontWeight: "bold",
        color: "black",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* 5. Hidden File Input for Image Selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
      <Box
        component={"img"}
        src={logoSrc}
        alt="User Logo"
        sx={{
          width: 300,
          cursor: "pointer",
          border: "2px dashed transparent",
          transition: "border 0.2s",
          "&:hover": {
            border: "2px dashed #3a7bd5",
          },
        }}
        onClick={handleImageClick}
      />

      {/* Editable Description Section */}
      <Box
        sx={{
          maxWidth: 400,
          textAlign: "center",
          mt: 2,
          width: "100%",
        }}
      >
        {isEditing ? (
          <TextField
            variant="outlined"
            fullWidth
            multiline
            // rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                textAlign: "center",
                "& textarea": {
                  textAlign: "center",
                },
              },
            }}
          />
        ) : (
          <Typography
            onClick={() => setIsEditing(true)}
            sx={{
              cursor: "text",
              p: 1,
              border: "1px solid transparent",
              "&:hover": {
                border: "1px dashed #ccc",
              },
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SlideLogo;

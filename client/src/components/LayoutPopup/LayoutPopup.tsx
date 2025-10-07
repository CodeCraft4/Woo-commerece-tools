// LayoutPopup.tsx
import { Box, IconButton, Typography } from "@mui/material";
import { BorderColorOutlined, TitleOutlined, Check } from "@mui/icons-material";
import PopupWrapper from "../PopupWrapper/PopupWrapper";
import { useWishCard } from "../../context/WishCardContext";

interface LayoutPopupProps {
  onClose: () => void;
}

const LayoutPopup = ({ onClose }: LayoutPopupProps) => {
  const {
    oneTextValue,
    setShowOneTextRightSideBox,
    multipleTextValue,
    setMultipleTextValue,
  } = useWishCard();

  // Helper functions to ensure only one layout is active
  const handleBlankLayout = () => {
    setShowOneTextRightSideBox(false);
    setMultipleTextValue(false);
  };

  const handleOneTextLayout = () => {
    setShowOneTextRightSideBox(true);
    setMultipleTextValue(false); // hide others
  };

  const handleMultipleTextLayout = () => {
    setMultipleTextValue(true);
    setShowOneTextRightSideBox(false); // hide others
  };

  return (
    <PopupWrapper title="Layout" onClose={onClose} sx={{ width: 300 }}>
      {/* Layout Box */}
      <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {/* Blank layout */}
        <Box
          onClick={handleBlankLayout}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            width: "130px",
            border: "1px solid #555555ff",
            borderRadius: "6px",
            flexDirection: "column",
            gap: 1,
            color: "gray",
            position: "relative",
          }}
        >
          <BorderColorOutlined />
          Blank
          {/* <IconButton
            // onClick={() => id}
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
            aria-label="Delete uploaded image"
          >
            <Check
              fontSize="small"
              sx={{
                color: "white",
                fontSize: "16px",
              }}
            />
          </IconButton> */}
        </Box>

        {/* OneText Layout */}
        <Box
          component={"div"}
          sx={{
            height: "200px",
            width: "130px",
            border: "1px solid #555555ff",
            borderRadius: "6px",
            p: 1.5,
            cursor: "pointer",
            position: "relative",
          }}
          onClick={handleOneTextLayout}
        >
          <Typography
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              m: "auto",
              color: "gray",
              border: "3px dashed #3a7bd5",
            }}
          >
            <TitleOutlined />
          </Typography>

          {oneTextValue && (
            <IconButton
              // onClick={() => handleSelectedImg(id)}
              sx={{
                position: "absolute",
                bottom: 3,
                right: 0,
                bgcolor: "#3a7bd5",
                zIndex: 99,
                border: "2px solid white",
                width: "20px",
                height: "20px",
              }}
              size="small"
              aria-label="Delete uploaded image"
            >
              <Check
                fontSize="small"
                sx={{
                  color: "white",
                  fontSize: "16px",
                }}
              />
            </IconButton>
          )}
        </Box>

        {/* Multiple Text Layout */}
        <Box
          sx={{
            height: "200px",
            width: "140px",
            border: "1px solid #555555ff",
            borderRadius: "6px",
            p: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            position: "relative",
          }}
          onClick={handleMultipleTextLayout}
        >
          <Typography
            sx={{
              width: "100%",
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              m: "auto",
              color: "gray",
              border: "2px dashed #3a7bd5",
            }}
          >
            <TitleOutlined />
          </Typography>
          <Typography
            sx={{
              width: "100%",
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              m: "auto",
              color: "gray",
              border: "2px dashed #3a7bd5",
            }}
          >
            <TitleOutlined />
          </Typography>
          <Typography
            sx={{
              width: "100%",
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              m: "auto",
              color: "gray",
              border: "2px dashed #3a7bd5",
            }}
          >
            <TitleOutlined />
          </Typography>

          {multipleTextValue && (
            <IconButton
              // onClick={() => handleSelectedImg(id)}
              sx={{
                position: "absolute",
                bottom: 3,
                right: 0,
                bgcolor: "#3a7bd5",
                zIndex: 99,
                border: "2px solid white",
                width: "20px",
                height: "20px",
              }}
              size="small"
              aria-label="Delete uploaded image"
            >
              <Check
                fontSize="small"
                sx={{
                  color: "white",
                  fontSize: "16px",
                }}
              />
            </IconButton>
          )}
        </Box>
      </Box>
    </PopupWrapper>
  );
};

export default LayoutPopup;

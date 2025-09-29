// PopupWrapper.tsx
import { Box, Typography, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

interface PopupWrapperProps {
  title: string;
  onClose?: () => void;
  children: React.ReactNode;
  sx?: object;
}

const PopupWrapper = ({
  title,
  onClose,
  children,
  sx = {},
}: PopupWrapperProps) => {
  return (
    <Box
      sx={{
        bgcolor: "white",
        textAlign: "center",
        borderRadius: "10px",
        height: "600px",
        position: "absolute",
        top: 105,
        left: "12%",
        p: 2,
        width: "300px",
        boxShadow: "3px 4px 12px #d6d6d6ff",
        ...sx,
      }}
    >
      <Typography
        sx={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#4d4d4dff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {title}
        {onClose && (
          <IconButton onClick={onClose}>
            <Close fontSize="large" />
          </IconButton>
        )}
      </Typography>
      {children}
    </Box>
  );
};

export default PopupWrapper;

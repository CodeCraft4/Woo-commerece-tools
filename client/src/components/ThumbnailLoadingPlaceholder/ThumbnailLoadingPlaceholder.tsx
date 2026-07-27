import { Box, LinearProgress, type SxProps, type Theme } from "@mui/material";

type Props = {
  sx?: SxProps<Theme>;
  showProgress?: boolean;
};

const ThumbnailLoadingPlaceholder = ({ sx, showProgress = true }: Props) => (
  <Box
    role="status"
    aria-label={showProgress ? "Product image loading" : "Product image unavailable"}
    sx={{
      position: "relative",
      overflow: "hidden",
      display: "grid",
      placeItems: "center",
      bgcolor: "#fff",
      ...sx,
    }}
  >
    <Box
      component="img"
      src="/assets/icons/image-placeholder.svg"
      alt=""
      aria-hidden="true"
      sx={{
        width: "72%",
        height: "72%",
        maxWidth: 260,
        maxHeight: 230,
        objectFit: "contain",
        display: "block",
      }}
    />
    {showProgress ? (
      <LinearProgress
        aria-label="Loading product image"
        sx={{
          position: "absolute",
          left: "12%",
          right: "12%",
          bottom: 14,
          height: 5,
          borderRadius: 999,
          bgcolor: "rgba(65, 141, 142, 0.18)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            bgcolor: "#418d8e",
          },
        }}
      />
    ) : null}
  </Box>
);

export default ThumbnailLoadingPlaceholder;

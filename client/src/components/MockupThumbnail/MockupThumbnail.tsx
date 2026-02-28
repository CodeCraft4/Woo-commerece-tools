import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { useState } from "react";
import SmartImage from "../SmartImage/SmartImage";
import { getMockupConfig } from "../../lib/mockup";

type Props = {
  category?: string;
  src?: string | null;
  alt?: string;
  useMockup?: boolean;
  enableSmartCrop?: boolean;
  containerSx?: SxProps<Theme>;
  imageSx?: SxProps<Theme>;
};

const isValidSrc = (v?: string | null) => Boolean(v && String(v).trim());

const MockupThumbnail = ({
  category,
  src,
  alt = "preview",
  useMockup = false,
  enableSmartCrop = false,
  containerSx,
  imageSx,
}: Props) => {
  const cfg = useMockup ? getMockupConfig(category) : null;
  const canMockup = Boolean(cfg?.mockupSrc && cfg?.overlay && isValidSrc(src));
  const [mockupOk, setMockupOk] = useState(true);

  if (!canMockup || !mockupOk) {
    return (
      <SmartImage
        src={src ?? ""}
        alt={alt}
        enable={enableSmartCrop}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
          ...imageSx,
        }}
      />
    );
  }

  const overlay = cfg!.overlay;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        ...containerSx,
      }}
    >
      <Box
        component="img"
        src={cfg!.mockupSrc}
        alt="mockup"
        onError={() => setMockupOk(false)}
        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Box
        sx={{
          position: "absolute",
          top: overlay.top,
          left: overlay.left,
          width: overlay.width,
          height: overlay.height,
          opacity: overlay.opacity ?? 1,
          filter: overlay.filter,
          clipPath: overlay.clipPath,
          WebkitClipPath: overlay.clipPath,
          borderRadius: overlay.borderRadius ?? 0,
          transform: overlay.rotate ? `rotate(${overlay.rotate})` : "none",
          ...(overlay.sx as any),
        }}
      >
        <Box
          component="img"
          src={src ?? ""}
          alt={alt}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: overlay.objectFit ?? "cover",
            display: "block",
            ...imageSx,
          }}
        />
      </Box>
    </Box>
  );
};

export default MockupThumbnail;

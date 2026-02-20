import { Box, type SxProps, type Theme } from "@mui/material";
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { cropImageToContent } from "../../lib/thumbnail";

type SmartImageProps = ComponentPropsWithoutRef<"img"> & {
  enable?: boolean;
  sx?: SxProps<Theme>;
};

const cache = new Map<string, string>();

const SmartImage = ({ src, alt, enable = false, sx, ...rest }: SmartImageProps) => {
  const [displaySrc, setDisplaySrc] = useState(src ?? "");

  useEffect(() => {
    if (!src) {
      setDisplaySrc("");
      return;
    }

    if (!enable) {
      setDisplaySrc(src);
      return;
    }

    const cached = cache.get(src);
    if (cached) {
      setDisplaySrc(cached);
      return;
    }

    let active = true;
    cropImageToContent(src).then((cropped) => {
      if (!active) return;
      const finalSrc = cropped || src;
      cache.set(src, finalSrc);
      setDisplaySrc(finalSrc);
    });

    return () => {
      active = false;
    };
  }, [src, enable]);

  return <Box component="img" src={displaySrc} alt={alt ?? ""} sx={sx} {...rest} />;
};

export default SmartImage;

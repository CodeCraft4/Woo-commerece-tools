import { Box, type SxProps, type Theme } from "@mui/material";
import { useEffect, useState, type ComponentPropsWithoutRef } from "react";
import { cropImageToContent } from "../../lib/thumbnail";
import ThumbnailLoadingPlaceholder from "../ThumbnailLoadingPlaceholder/ThumbnailLoadingPlaceholder";

type SmartImageProps = ComponentPropsWithoutRef<"img"> & {
  enable?: boolean;
  sx?: SxProps<Theme>;
};

const cache = new Map<string, string>();
type LoadedImage = {
  requestedSrc: string;
  displaySrc: string;
};

const SmartImage = ({
  src,
  alt,
  enable = false,
  sx,
  onLoad,
  onError,
  ...rest
}: SmartImageProps) => {
  const requestedSrc = String(src ?? "").trim();
  const [loadedImage, setLoadedImage] = useState<LoadedImage | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);

    if (!requestedSrc) {
      setLoadedImage(null);
      setLoadFailed(true);
      return;
    }

    let active = true;

    const loadValidatedImage = (candidate: string) => {
      const image = new Image();

      image.onload = () => {
        if (!active) return;
        cache.set(requestedSrc, candidate);
        setLoadedImage({
          requestedSrc,
          displaySrc: candidate,
        });
      };

      image.onerror = () => {
        if (!active) return;
        setLoadedImage(null);
        setLoadFailed(true);
      };

      image.src = candidate;
    };

    const cached = cache.get(requestedSrc);
    if (cached) {
      loadValidatedImage(cached);
    } else if (enable) {
      cropImageToContent(requestedSrc)
        .then((cropped) => {
          if (!active) return;
          loadValidatedImage(cropped || requestedSrc);
        })
        .catch(() => {
          if (!active) return;
          loadValidatedImage(requestedSrc);
        });
    } else {
      loadValidatedImage(requestedSrc);
    }

    return () => {
      active = false;
    };
  }, [requestedSrc, enable]);

  const displaySrc =
    loadedImage?.requestedSrc === requestedSrc ? loadedImage.displaySrc : "";

  if (!displaySrc) {
    return <ThumbnailLoadingPlaceholder sx={sx} showProgress={!loadFailed} />;
  }

  return (
    <Box
      component="img"
      src={displaySrc}
      alt={alt ?? ""}
      onLoad={(event) => {
        onLoad?.(event);
      }}
      onError={(event) => {
        setLoadedImage(null);
        setLoadFailed(true);
        onError?.(event);
      }}
      sx={sx}
      {...rest}
    />
  );
};

export default SmartImage;

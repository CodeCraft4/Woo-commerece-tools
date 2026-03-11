import { Box, Button, Modal, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";

type Props = {
  open: boolean;
  imageSrc: string;
  aspect?: number;
  onClose: () => void;
  onApply: (croppedImageSrc: string) => void;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Size = {
  width: number;
  height: number;
};

const MIN_CROP_SIZE = 24;

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const normalizeImageSrc = (src: string) => {
  const value = String(src ?? "").trim();
  if (!value) return "";

  const urlMatch = value.match(/^url\((.*)\)$/i);
  if (!urlMatch) return value;

  return urlMatch[1].trim().replace(/^['"]|['"]$/g, "");
};

const getContainedImageRect = (stage: Size, image: Size): Rect | null => {
  if (!stage.width || !stage.height || !image.width || !image.height) return null;

  const scale = Math.min(stage.width / image.width, stage.height / image.height);
  const width = Math.max(1, image.width * scale);
  const height = Math.max(1, image.height * scale);

  return {
    x: (stage.width - width) / 2,
    y: (stage.height - height) / 2,
    width,
    height,
  };
};

const buildDefaultCropRect = (imageRect: Rect, aspect?: number): Rect => {
  const safeAspect = Number.isFinite(aspect) && Number(aspect) > 0 ? Number(aspect) : 1;
  const wByBounds = imageRect.width * 0.8;
  const hByBounds = imageRect.height * 0.8;

  let width = wByBounds;
  let height = width / safeAspect;

  if (height > hByBounds) {
    height = hByBounds;
    width = height * safeAspect;
  }

  if (!Number.isFinite(width) || width <= 0) width = wByBounds;
  if (!Number.isFinite(height) || height <= 0) height = hByBounds;

  return {
    x: (imageRect.width - width) / 2,
    y: (imageRect.height - height) / 2,
    width,
    height,
  };
};

const getCroppedImage = async (src: string, area: Rect) => {
  const image = await createImage(src);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;

  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));

  ctx.drawImage(
    image,
    Math.round(area.x),
    Math.round(area.y),
    Math.round(area.width),
    Math.round(area.height),
    0,
    0,
    canvas.width,
    canvas.height,
  );

  try {
    return canvas.toDataURL("image/png");
  } catch {
    return src;
  }
};

const ImageCropModal = ({ open, imageSrc, aspect = 1, onClose, onApply }: Props) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const initKeyRef = useRef("");

  const [stageSize, setStageSize] = useState<Size>({ width: 0, height: 0 });
  const [imageNatural, setImageNatural] = useState<Size>({ width: 0, height: 0 });
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [saving, setSaving] = useState(false);

  const normalizedSrc = useMemo(() => normalizeImageSrc(imageSrc), [imageSrc]);

  const measureStage = useCallback(() => {
    const node = stageRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    setStageSize({
      width: Math.max(0, rect.width),
      height: Math.max(0, rect.height),
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    measureStage();

    let raf = 0;
    const startedAt = Date.now();
    const tick = () => {
      measureStage();
      if (Date.now() - startedAt < 1200) {
        raf = window.requestAnimationFrame(tick);
      }
    };
    raf = window.requestAnimationFrame(tick);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && stageRef.current) {
      ro = new ResizeObserver(measureStage);
      ro.observe(stageRef.current);
    }

    const onResize = () => measureStage();
    window.addEventListener("resize", onResize);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [open, measureStage]);

  useEffect(() => {
    if (!open || !normalizedSrc) return;

    let cancelled = false;
    createImage(normalizedSrc)
      .then((img) => {
        if (cancelled) return;
        setImageNatural({
          width: Math.max(1, img.naturalWidth || img.width || 1),
          height: Math.max(1, img.naturalHeight || img.height || 1),
        });
      })
      .catch(() => {
        if (cancelled) return;
        setImageNatural({ width: 0, height: 0 });
      });

    return () => {
      cancelled = true;
    };
  }, [open, normalizedSrc]);

  useEffect(() => {
    if (!open) {
      initKeyRef.current = "";
      setCropRect(null);
      setImageNatural({ width: 0, height: 0 });
      setStageSize({ width: 0, height: 0 });
    }
  }, [open]);

  const imageRect = useMemo(() => {
    return getContainedImageRect(stageSize, imageNatural);
  }, [stageSize, imageNatural]);

  const defaultCropRect = useMemo(() => {
    if (!imageRect) return null;
    return buildDefaultCropRect(imageRect, aspect);
  }, [imageRect, aspect]);

  const clampToImageRect = useCallback(
    (rect: Rect): Rect => {
      if (!imageRect) return rect;
      const width = clamp(rect.width, MIN_CROP_SIZE, imageRect.width);
      const height = clamp(rect.height, MIN_CROP_SIZE, imageRect.height);
      const x = clamp(rect.x, 0, imageRect.width - width);
      const y = clamp(rect.y, 0, imageRect.height - height);
      return { x, y, width, height };
    },
    [imageRect],
  );

  useEffect(() => {
    if (!open || !imageRect || !defaultCropRect) return;

    const key = `${normalizedSrc}|${Math.round(imageRect.width)}x${Math.round(imageRect.height)}`;
    if (initKeyRef.current === key) return;

    initKeyRef.current = key;
    setCropRect(defaultCropRect);
  }, [open, normalizedSrc, imageRect, defaultCropRect]);

  const resolvedCropRect = useMemo(() => {
    return cropRect ?? defaultCropRect;
  }, [cropRect, defaultCropRect]);

  const handleApply = useCallback(async () => {
    if (!normalizedSrc) return;

    const effectiveCropRect = resolvedCropRect;
    if (!effectiveCropRect || !imageRect || !imageNatural.width || !imageNatural.height) {
      onApply(normalizedSrc);
      return;
    }

    const scaleX = imageNatural.width / imageRect.width;
    const scaleY = imageNatural.height / imageRect.height;

    const cropX = clamp(Math.round(effectiveCropRect.x * scaleX), 0, imageNatural.width - 1);
    const cropY = clamp(Math.round(effectiveCropRect.y * scaleY), 0, imageNatural.height - 1);
    const cropW = clamp(Math.round(effectiveCropRect.width * scaleX), 1, imageNatural.width - cropX);
    const cropH = clamp(Math.round(effectiveCropRect.height * scaleY), 1, imageNatural.height - cropY);

    setSaving(true);
    try {
      const cropped = await getCroppedImage(normalizedSrc, {
        x: cropX,
        y: cropY,
        width: cropW,
        height: cropH,
      });
      onApply(cropped);
    } finally {
      setSaving(false);
    }
  }, [resolvedCropRect, imageRect, imageNatural, normalizedSrc, onApply]);

  const points = [
    { x: "0%", y: "0%" },
    { x: "50%", y: "0%" },
    { x: "100%", y: "0%" },
    { x: "0%", y: "50%" },
    { x: "50%", y: "50%" },
    { x: "100%", y: "50%" },
    { x: "0%", y: "100%" },
    { x: "50%", y: "100%" },
    { x: "100%", y: "100%" },
  ];

  return (
    <Modal open={open} onClose={saving ? undefined : onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: 620 },
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 24,
          p: 2,
          outline: "none",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Crop Image
        </Typography>

        <Box
          ref={stageRef}
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: 320, sm: 420 },
            bgcolor: "#111",
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          {normalizedSrc ? (
            <Box
              component="img"
              src={normalizedSrc}
              alt=""
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                objectPosition: "center",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
                zIndex: 1,
              }}
              onLoad={(e) => {
                const t = e.currentTarget;
                setImageNatural({
                  width: Math.max(1, t.naturalWidth || t.width || 1),
                  height: Math.max(1, t.naturalHeight || t.height || 1),
                });
              }}
              onError={() => {
                setImageNatural({ width: 0, height: 0 });
              }}
            />
          ) : null}

          {normalizedSrc && imageRect ? (
            <Box
              sx={{
                position: "absolute",
                left: imageRect.x,
                top: imageRect.y,
                width: imageRect.width,
                height: imageRect.height,
                overflow: "hidden",
                zIndex: 2,
              }}
            >
              {resolvedCropRect ? (
                <Rnd
                  bounds="parent"
                  disableDragging={saving}
                  enableResizing={
                    saving
                      ? false
                      : {
                          top: true,
                          right: true,
                          bottom: true,
                          left: true,
                          topRight: true,
                          topLeft: true,
                          bottomRight: true,
                          bottomLeft: true,
                        }
                  }
                  minWidth={MIN_CROP_SIZE}
                  minHeight={MIN_CROP_SIZE}
                  size={{ width: resolvedCropRect.width, height: resolvedCropRect.height }}
                  position={{ x: resolvedCropRect.x, y: resolvedCropRect.y }}
                  onDragStop={(_, d) => {
                    const next = {
                      x: d.x,
                      y: d.y,
                      width: resolvedCropRect.width,
                      height: resolvedCropRect.height,
                    };
                    setCropRect(clampToImageRect(next));
                  }}
                  onResizeStop={(_, __, ref, ___, position) => {
                    const next = {
                      x: position.x,
                      y: position.y,
                      width: parseFloat(ref.style.width) || MIN_CROP_SIZE,
                      height: parseFloat(ref.style.height) || MIN_CROP_SIZE,
                    };
                    setCropRect(clampToImageRect(next));
                  }}
                  style={{
                    border: "2px solid #2196f3",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                    background: "transparent",
                    zIndex: 3,
                  }}
                  resizeHandleStyles={{
                    top: { height: 10, marginTop: -5, cursor: "ns-resize", background: "#2196f3" },
                    right: { width: 10, marginRight: -5, cursor: "ew-resize", background: "#2196f3" },
                    bottom: { height: 10, marginBottom: -5, cursor: "ns-resize", background: "#2196f3" },
                    left: { width: 10, marginLeft: -5, cursor: "ew-resize", background: "#2196f3" },
                    topLeft: { width: 12, height: 12, marginTop: -6, marginLeft: -6, cursor: "nwse-resize", background: "#2196f3" },
                    topRight: { width: 12, height: 12, marginTop: -6, marginRight: -6, cursor: "nesw-resize", background: "#2196f3" },
                    bottomLeft: { width: 12, height: 12, marginBottom: -6, marginLeft: -6, cursor: "nesw-resize", background: "#2196f3" },
                    bottomRight: { width: 12, height: 12, marginBottom: -6, marginRight: -6, cursor: "nwse-resize", background: "#2196f3" },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      cursor: saving ? "default" : "move",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: "33.3333%",
                        left: 0,
                        right: 0,
                        borderTop: "1px solid rgba(255,255,255,0.7)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: "66.6666%",
                        left: 0,
                        right: 0,
                        borderTop: "1px solid rgba(255,255,255,0.7)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        left: "33.3333%",
                        top: 0,
                        bottom: 0,
                        borderLeft: "1px solid rgba(255,255,255,0.7)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        left: "66.6666%",
                        top: 0,
                        bottom: 0,
                        borderLeft: "1px solid rgba(255,255,255,0.7)",
                      }}
                    />

                    {points.map((p, idx) => (
                      <Box
                        // eslint-disable-next-line react/no-array-index-key
                        key={`pt-${idx}`}
                        sx={{
                          position: "absolute",
                          left: p.x,
                          top: p.y,
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: "#2196f3",
                          border: "1px solid #ffffff",
                          transform: "translate(-50%, -50%)",
                          pointerEvents: "none",
                        }}
                      />
                    ))}
                  </Box>
                </Rnd>
              ) : null}
            </Box>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleApply} disabled={saving}>
            Apply
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ImageCropModal;

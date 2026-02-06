import { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { CollectionsOutlined } from "@mui/icons-material";
import { useSlide1 } from "../../../../../context/Slide1Context";

export type Slide1PreviewBoxProps = {
  width?: number | string;
  height?: number | string;
  scale?: number;
  borderRadius?: number;
};

type LayerNode =
  | { kind: "image"; id: string; z: number; node: any }
  | { kind: "sticker"; id: string; z: number; node: any }
  | { kind: "text"; id: string; z: number; node: any }
  | { kind: "ai"; id: string; z: number; node: any };

const num = (v: any, d = 0) => (typeof v === "number" && !Number.isNaN(v) ? v : d);
const str = (v: any, d = "") => (typeof v === "string" ? v : d);
const bool = (v: any, d = false) => (typeof v === "boolean" ? v : d);

export default function Slide1PreviewBox({
  width = 505,
  height = 700,
  scale = 1,
  borderRadius = 12,
}: Slide1PreviewBoxProps) {
  const s1 = useSlide1();

  const {
    bgColor1,
    bgImage1,
    bgRect1,
    draggableImages1,
    selectedImg1,
    selectedStickers1,
    textElements1,
    showOneTextRightSideBox1,
    oneTextValue1,
    fontSize1,
    fontWeight1,
    fontColor1,
    fontFamily1,
    textAlign1,
    verticalAlign1,
    rotation1,
    lineHeight1,
    letterSpacing1,
    multipleTextValue1,
    texts1,
    isAIimage1,
    selectedAIimageUrl1,
    aimage1,
  } = s1 as any;

  const layers = useMemo<LayerNode[]>(() => {
    const out: LayerNode[] = [];

    const images: any[] = Array.isArray(draggableImages1) ? draggableImages1 : [];
    const selectedIds = new Set(Array.isArray(selectedImg1) ? selectedImg1 : []);
    images
      .filter((img: any) => selectedIds.has(img.id))
      .forEach((img: any) => {
        out.push({
          kind: "image",
          id: str(img.id),
          z: num(img.zIndex, 1),
          node: img,
        });
      });

    const stickers: any[] = Array.isArray(selectedStickers1) ? selectedStickers1 : [];
    stickers.forEach((st, idx) => {
      out.push({
        kind: "sticker",
        id: str(st.id, `st-${idx}`),
        z: num(st.zIndex, 1),
        node: st,
      });
    });

    const texts: any[] = Array.isArray(textElements1) ? textElements1 : [];
    texts.forEach((t) => {
      out.push({
        kind: "text",
        id: str(t.id),
        z: num(t.zIndex, 1),
        node: t,
      });
    });

    if (bool(isAIimage1, false) && str(selectedAIimageUrl1).trim().length > 0) {
      out.push({
        kind: "ai",
        id: "ai-image",
        z: 9999,
        node: {
          src: selectedAIimageUrl1,
          x: num(aimage1?.x, 0),
          y: num(aimage1?.y, 0),
          width: num(aimage1?.width, 200),
          height: num(aimage1?.height, 200),
        },
      });
    }

    return out.sort((a, b) => a.z - b.z);
  }, [
    draggableImages1,
    selectedImg1,
    selectedStickers1,
    textElements1,
    isAIimage1,
    selectedAIimageUrl1,
    aimage1,
  ]);

  const isEmptyPreview = useMemo(() => {
    const hasBgImage = str(bgImage1).trim().length > 0;

    const hasLayers = layers.length > 0;

    const hasOneText =
      bool(showOneTextRightSideBox1, false) && str(oneTextValue1).trim().length > 0;

    const hasMultiText =
      bool(multipleTextValue1, false) &&
      Array.isArray(texts1) &&
      texts1.some((t: any) => str(t?.value).trim().length > 0);

    return !(hasBgImage || hasLayers || hasOneText || hasMultiText);
  }, [bgImage1, layers, showOneTextRightSideBox1, oneTextValue1, multipleTextValue1, texts1]);

  const containerSx = useMemo(
    () => ({
      width,
      height,
      position: "relative" as const,
      overflow: "hidden",
      transform: `scale(${scale})`,
      transformOrigin: "top left",
      //   borderRadius,
      bgcolor: bgColor1 ?? "transparent",
    }),
    [width, height, scale, borderRadius, bgColor1],
  );

  const bgRect = bgRect1 ?? { x: 0, y: 0, width: "100%", height: "100%" };

  const hAlign =
    textAlign1 === "start" ? "flex-start" : textAlign1 === "end" ? "flex-end" : "center";
  const vAlign =
    verticalAlign1 === "top" ? "flex-start" : verticalAlign1 === "bottom" ? "flex-end" : "center";

  if (isEmptyPreview) {
    return (
      <Box sx={{ ...containerSx, display: "grid", placeItems: "center" }}>
        <Box sx={{ textAlign: "center", opacity: 0.65 }}>
          <CollectionsOutlined sx={{ fontSize: 64 }} />
          <Typography sx={{ mt: 1, fontWeight: 700, fontSize: 14 }}>
            No preview yet
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={containerSx}>
      {/* BG */}
      {str(bgImage1).trim().length > 0 ? (
        <Box
          sx={{
            position: "absolute",
            left: num(bgRect.x, 0),
            top: num(bgRect.y, 0),
            width: num(bgRect.width, typeof width === "number" ? width : 475),
            height: num(bgRect.height, typeof height === "number" ? height : 700),
            backgroundImage: `url(${bgImage1})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
      ) : null}

      {/* Layers */}
      {layers.map((l) => {
        if (l.kind === "image") {
          const img = l.node;
          const rotation = num(img.rotation, 0);
          const clipPath = str(img.shapePath ?? img.clipPath ?? "none", "none");
          return (
            <Box
              key={`img:${l.id}`}
              sx={{
                position: "absolute",
                left: num(img.x, 0),
                top: num(img.y, 0),
                width: num(img.width, 120),
                height: num(img.height, 120),
                zIndex: l.z,
                borderRadius: 1,
                overflow: "hidden",
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center",
              }}
            >
              <Box
                component="img"
                src={img.src}
                alt=""
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "fill",
                  filter: img.filter || "none",
                  clipPath: clipPath !== "none" ? clipPath : undefined,
                  WebkitClipPath: clipPath !== "none" ? clipPath : undefined,
                }}
              />
            </Box>
          );
        }

        if (l.kind === "sticker") {
          const st = l.node;
          const rotation = num(st.rotation, 0);
          return (
            <Box
              key={`st:${l.id}`}
              sx={{
                position: "absolute",
                left: num(st.x, 0),
                top: num(st.y, 0),
                width: num(st.width, 80),
                height: num(st.height, 80),
                zIndex: l.z,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center",
              }}
            >
              <Box
                component="img"
                src={st.sticker}
                alt=""
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
          );
        }

        if (l.kind === "text") {
          const t = l.node;
          const rotation = num(t.rotation, 0);
          const value = str(t.value, "");
          const size = t.size ?? { width: 200, height: 40 };
          const pos = t.position ?? { x: 0, y: 0 };

          const thAlign =
            t.textAlign === "start" ? "flex-start" : t.textAlign === "end" ? "flex-end" : "center";
          const tvAlign =
            t.verticalAlign === "top"
              ? "flex-start"
              : t.verticalAlign === "bottom"
                ? "flex-end"
                : "center";

          return (
            <Box
              key={`tx:${l.id}`}
              sx={{
                position: "absolute",
                left: num(pos.x, 0),
                top: num(pos.y, 0),
                width: num(size.width, 200),
                height: num(size.height, 40),
                zIndex: l.z,
                display: "flex",
                alignItems: tvAlign,
                justifyContent: thAlign,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: "center",
                pointerEvents: "none",
              }}
            >
              <Typography
                sx={{
                  width: "100%",
                  fontSize: num(t.fontSize, 16),
                  fontWeight: num(t.fontWeight, 400),
                  color: t.fontColor || "#000",
                  fontFamily: t.fontFamily || "Roboto",
                  textAlign: t.textAlign || "center",
                  lineHeight: t.lineHeight || 1.4,
                  letterSpacing: t.letterSpacing ? `${t.letterSpacing}px` : "0px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {value}
              </Typography>
            </Box>
          );
        }

        if (l.kind === "ai") {
          const ai = l.node;
          return (
            <Box
              key="ai"
              sx={{
                position: "absolute",
                left: num(ai.x, 0),
                top: num(ai.y, 0),
                width: num(ai.width, 200),
                height: num(ai.height, 200),
                zIndex: l.z,
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={ai.src}
                alt=""
                sx={{ width: "100%", height: "100%", objectFit: "fill" }}
              />
            </Box>
          );
        }

        return null;
      })}

      {/* oneText overlay */}
      {bool(showOneTextRightSideBox1, false) && (
        <Box
          sx={{
            position: "absolute",
            left: 10,
            top: 10,
            width: "calc(100% - 20px)",
            height: "calc(100% - 20px)",
            borderRadius: 2,
            display: "flex",
            alignItems: vAlign,
            justifyContent: hAlign,
            p: 2,
            zIndex: 9000,
            pointerEvents: "none",
          }}
        >
          <Typography
            sx={{
              width: "100%",
              fontSize: num(fontSize1, 16),
              fontWeight: num(fontWeight1, 400),
              color: fontColor1 || "#000",
              fontFamily: fontFamily1 || "Roboto",
              textAlign: textAlign1 || "center",
              transform: `rotate(${num(rotation1, 0)}deg)`,
              lineHeight: lineHeight1 || 1.4,
              letterSpacing: letterSpacing1 ? `${letterSpacing1}px` : "0px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {str(oneTextValue1, "")}
          </Typography>
        </Box>
      )}

      {/* multiText overlay */}
      {bool(multipleTextValue1, false) && Array.isArray(texts1) && texts1.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            left: 10,
            top: 10,
            width: "calc(100% - 20px)",
            height: "calc(100% - 20px)",
            zIndex: 9000,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            pointerEvents: "none",
          }}
        >
          {texts1.map((t: any, idx: number) => (
            <Box
              key={`mtext-${idx}`}
              sx={{
                flex: 1,
                borderRadius: 2,
                display: "flex",
                alignItems:
                  t.verticalAlign === "top"
                    ? "flex-start"
                    : t.verticalAlign === "bottom"
                      ? "flex-end"
                      : "center",
                justifyContent:
                  t.textAlign === "left"
                    ? "flex-start"
                    : t.textAlign === "right"
                      ? "flex-end"
                      : "center",
                p: 1,
                overflow: "hidden",
              }}
            >
              <Typography
                sx={{
                  width: "100%",
                  fontSize: num(t.fontSize1, 16),
                  fontWeight: num(t.fontWeight1, 400),
                  color: t.fontColor1 || "#000",
                  fontFamily: t.fontFamily1 || "Roboto",
                  textAlign: t.textAlign || "center",
                  lineHeight: t.lineHeight || 1.4,
                  letterSpacing: t.letterSpacing ? `${t.letterSpacing}px` : "0px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {str(t.value, "")}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

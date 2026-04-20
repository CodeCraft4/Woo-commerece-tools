import { Box, Typography } from "@mui/material";
import { useSlide1 } from "../../../../../context/Slide1Context";
import QrGenerator from "../../../../../components/QR-code/Qrcode";

type AnyEl = Record<string, any>;

const safeClip = (cp?: string | null) => (cp && typeof cp === "string" ? cp : "none");
const safeFilter = (f?: string | null) => (f && typeof f === "string" ? f : "none");
const val = <T,>(v: T | undefined, d: T) => (v === undefined || v === null ? d : v);
const normalizeUrl = (value: any) => {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && typeof value.url === "string") return value.url.trim();
  return "";
};
const safeQrSize = (box: any, fallback = 70) => {
  const w = Number(box?.width);
  const h = Number(box?.height);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) return Math.min(w, h);
  if (Number.isFinite(w) && w > 0) return w;
  if (Number.isFinite(h) && h > 0) return h;
  return fallback;
};

type Slide1Props = {
  ref?: any;
};

const Slide1 = (props: Slide1Props) => {
  const {
    texts1,
    oneTextValue1,
    multipleTextValue1,
    draggableImages1,
    fontColor1,
    fontFamily1,
    fontSize1,
    fontWeight1,
    selectedImg1,
    verticalAlign1,
    selectedVideoUrl1,
    selectedAudioUrl1,
    qrPosition1,
    textAlign1,
    selectedLayout1,
    showOneTextRightSideBox1,
    textElements1,
    qrAudioPosition1,
    selectedAIimageUrl1,
    selectedStickers1,
    isAIimage1,
    aimage1,
    lineHeight1,
    letterSpacing1,
    layout1,
    bgColor1,
  } = useSlide1();
  const { ref } = props;
  const isOneTextActive = selectedLayout1 === "oneText" || showOneTextRightSideBox1;
  const videoUrl = normalizeUrl(selectedVideoUrl1);
  const audioUrl = normalizeUrl(selectedAudioUrl1);
  const qrVideoUrl = normalizeUrl(qrPosition1?.url) || videoUrl;
  const qrAudioUrl = normalizeUrl(qrAudioPosition1?.url) || audioUrl;

  return (
    <Box
      ref={ref}
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: 2,
        backgroundColor: bgColor1 ?? "transparent",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {layout1 && (
        <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
          {layout1?.elements
            ?.slice()
            .sort((a: AnyEl, b: AnyEl) => val(a.zIndex, 1) - val(b.zIndex, 1))
            .map((el: AnyEl) => (
              <Box
                key={el.id}
                sx={{
                  position: "absolute",
                  left: val(el.x, 0),
                  top: val(el.y, 0),
                  width: val(el.width, 0),
                  height: val(el.height, 0),
                  borderRadius: 1,
                  overflow: "visible",
                  zIndex: val(el.zIndex, 1),
                }}
              >
                <Box
                  component="img"
                  src={el.src || undefined}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: el.id === "bg-image" ? "cover" : el.objectFit || "fill",
                    borderRadius: 1,
                    display: "block",
                    pointerEvents: "none",
                    filter: safeFilter(el.filter || el.cssFilter),
                    transform: `rotate(${val(el.rotation, 0)}deg)`,
                    transformOrigin: "center center",
                    clipPath: safeClip(el.clipPath || el.shapePath),
                    WebkitClipPath: safeClip(el.clipPath || el.shapePath),
                    mixBlendMode: el.blendMode || "normal",
                    opacity: el.opacity !== undefined ? el.opacity : 1,
                  }}
                />
              </Box>
            ))}

          {layout1.textElements
            ?.slice()
            .sort((a: AnyEl, b: AnyEl) => val(a.zIndex, 2) - val(b.zIndex, 2))
            .map((te: AnyEl) => {
              const hAlign =
                te.textAlign === "left" ? "flex-start" : te.textAlign === "right" ? "flex-end" : "center";
              const vAlign =
                te.verticalAlign === "top" ? "flex-start" : te.verticalAlign === "bottom" ? "flex-end" : "center";

              return (
                <Box
                  key={te.id}
                  sx={{
                    position: "absolute",
                    left: val(te.x, 0),
                    top: val(te.y, 0),
                    width: val(te.width, 0),
                    height: val(te.height, 0),
                    display: "flex",
                    justifyContent: hAlign,
                    alignItems: vAlign,
                    color: te.color || "#000",
                    fontSize: val(te.fontSize, 16),
                    fontFamily: te.fontFamily || "Roboto, sans-serif",
                    fontWeight: te.bold ? 700 : val(te.fontWeight, 400),
                    fontStyle: te.italic ? "italic" : "normal",
                    letterSpacing: te.letterSpacing !== undefined ? te.letterSpacing : 0,
                    lineHeight: te.lineHeight !== undefined ? te.lineHeight : 1.2,
                    textTransform: te.uppercase ? "uppercase" : "none",
                    textAlign: te.textAlign || "center",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    transform: `rotate(${val(te.rotation, 0)}deg)`,
                    transformOrigin: "center center",
                    zIndex: val(te.zIndex, 2),
                    pointerEvents: "none",
                  }}
                >
                  {te.text || ""}
                </Box>
              );
            })}

          {layout1.stickers
            ?.slice()
            .sort((a: AnyEl, b: AnyEl) => val(a.zIndex, 50) - val(b.zIndex, 50))
            .map((st: AnyEl) => (
              <Box
                key={st.id}
                sx={{
                  position: "absolute",
                  left: val(st.x, 0),
                  top: val(st.y, 0),
                  width: val(st.width, 0),
                  height: val(st.height, 0),
                  borderRadius: 1,
                  zIndex: val(st.zIndex, 50),
                  pointerEvents: "none",
                }}
              >
                <Box
                  component="img"
                  src={st.sticker}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    borderRadius: 1,
                    filter: safeFilter(st.filter || st.cssFilter),
                    transform: `rotate(${val(st.rotation, 0)}deg)`,
                    transformOrigin: "center center",
                    clipPath: safeClip(st.clipPath || st.shapePath),
                    WebkitClipPath: safeClip(st.clipPath || st.shapePath),
                    mixBlendMode: st.blendMode || "normal",
                    opacity: st.opacity !== undefined ? st.opacity : 1,
                  }}
                />
              </Box>
            ))}
        </Box>
      )}

      {videoUrl && (
        <Box
          sx={{
            position: "absolute",
            top: qrPosition1.y,
            left: qrPosition1.x,
            width: "100%",
            height: 180,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "center",
            zIndex: qrPosition1.zIndex || 1,
          }}
        >
          <Box
            component="img"
            src="/assets/images/video-qr-tips.png"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "6px",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 49,
              height: 10,
              width: 15,
              left: 58,
              borderRadius: 2,
            }}
          >
            <QrGenerator url={qrVideoUrl} size={safeQrSize(qrPosition1, 70)} />
          </Box>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <Typography
              sx={{
                position: "absolute",
                top: 71,
                right: 25,
                zIndex: 99,
                color: "black",
                fontSize: "10px",
                width: "105px",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {`${videoUrl.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {audioUrl && (
        <Box
          sx={{
            position: "absolute",
            top: qrAudioPosition1.y,
            left: qrAudioPosition1.x,
            width: "100%",
            height: 190,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "center",
            zIndex: qrAudioPosition1.zIndex || 1,
          }}
        >
          <Box
            component="img"
            src="/assets/images/audio-qr-tips.png"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "6px",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 57,
              height: 10,
              width: 15,
              left: 65,
              borderRadius: 2,
            }}
          >
            <QrGenerator url={qrAudioUrl} size={safeQrSize(qrAudioPosition1, 70)} />
          </Box>
          <a href={audioUrl} target="_blank" rel="noopener noreferrer">
            <Typography
              sx={{
                position: "absolute",
                top: 71,
                right: 25,
                zIndex: 99,
                color: "black",
                fontSize: "10px",
                width: "105px",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {`${audioUrl.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {draggableImages1
        .filter((img: any) => selectedImg1?.includes(img.id))
        .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
        .map((img: any) => (
          <Box
            key={img.id}
            component="img"
            src={img.src}
            sx={{
              position: "absolute",
              width: img.width,
              height: img.height,
              left: img.x,
              top: img.y,
              transform: `rotate(${img.rotation || 0}deg)`,
              transformOrigin: "center center",
              borderRadius: 2,
              objectFit: "cover",
              zIndex: img.zIndex || 1,
              filter: img.filter,
            }}
          />
        ))}

      {multipleTextValue1 &&
        texts1.map((e: any, index: number) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              left: 8,
              right: 8,
              top: 8 + index * 220,
              height: 210,
              borderRadius: "6px",
              display: "flex",
              alignItems:
                e.verticalAlign === "top" ? "flex-start" : e.verticalAlign === "center" ? "center" : "flex-end",
              justifyContent:
                e.textAlign === "left" ? "flex-start" : e.textAlign === "right" ? "flex-end" : "center",
              p: 1,
              zIndex: 9999,
              pointerEvents: "none",
            }}
          >
            <Typography
              sx={{
                fontSize: e.fontSize ?? 16,
                fontWeight: e.fontWeight ?? 400,
                color: e.fontColor ?? "#000",
                fontFamily: e.fontFamily ?? "Roboto, sans-serif",
                textAlign: e.textAlign ?? "center",
                lineHeight: e.lineHeight ?? 1.2,
                letterSpacing: e.letterSpacing ?? 0,
                width: "100%",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {e.value}
            </Typography>
          </Box>
        ))}

      {isOneTextActive && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent:
              verticalAlign1 === "top" ? "flex-start" : verticalAlign1 === "center" ? "center" : "flex-end",
            alignItems:
              textAlign1 === "start" ? "flex-start" : textAlign1 === "center" ? "center" : "flex-end",
            height: "100%",
            width: "100%",
            color: fontColor1,
            lineHeight: lineHeight1,
            letterSpacing: letterSpacing1,
            fontFamily: fontFamily1,
            fontSize: fontSize1,
            fontWeight: fontWeight1,
            textAlign: textAlign1,
            whiteSpace: "pre-wrap",
            p: 1,
          }}
        >
          {oneTextValue1}
        </Box>
      )}

      {multipleTextValue1 || isOneTextActive
        ? null
        : textElements1?.map((e: any) => (
            <Typography
              key={e.id}
              sx={{
                fontSize: e.fontSize,
                color: e.fontColor,
                fontFamily: e.fontFamily,
                fontWeight: e.fontWeight,
                textAlign: e.textAlign || "center",
                position: "absolute",
                left: e.position.x,
                top: e.position.y,
                width: e.size.width,
                height: e.size.height,
                display: "flex",
                zIndex: e.zIndex,
                lineHeight: e.lineHeight ?? 1.5,
                letterSpacing: `${e.letterSpacing ?? 0}px`,
                transform: `rotate(${e.rotation}deg)`,
                justifyContent: e.textAlign ?? "center",
                alignItems: e.verticalAlign ?? "top",
                padding: "5px",
                whiteSpace: "pre-line",
                cursor: "text",
              }}
            >
              {e.value}
            </Typography>
          ))}

      {isAIimage1 && (
        <img
          src={`${selectedAIimageUrl1}`}
          alt="AIimage"
          style={{
            position: "absolute",
            left: aimage1.x,
            top: aimage1.y,
            width: `${aimage1.width}px`,
            height: `${aimage1.height}px`,
            objectFit: "fill",
            pointerEvents: "none",
          }}
        />
      )}

      {selectedStickers1.map((sticker) => (
        <Box
          key={sticker.id}
          component="img"
          src={sticker.sticker}
          sx={{
            position: "absolute",
            left: sticker.x,
            top: sticker.y,
            width: `${sticker.width}px`,
            height: `${sticker.height}px`,
            objectFit: "contain",
            zIndex: sticker.zIndex,
            transform: `rotate(${sticker.rotation || 0}deg)`,
            pointerEvents: "none",
          }}
        />
      ))}
    </Box>
  );
};

export default Slide1;

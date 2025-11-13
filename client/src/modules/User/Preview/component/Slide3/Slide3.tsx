import { Box, Typography } from "@mui/material";
import { useSlide3 } from "../../../../../context/Slide3Context";
import QrGenerator from "../../../../../components/QR-code/Qrcode";

const Slide3 = () => {
  const {
    texts3,
    oneTextValue3,
    multipleTextValue3,
    draggableImages3,
    fontColor3,
    fontFamily3,
    fontSize3,
    fontWeight3,
    selectedImg3,
    verticalAlign3,
    selectedVideoUrl3,
    qrPosition3,
    textAlign3,
    selectedLayout3,
    selectedAudioUrl3,
    qrAudioPosition3,
    textElements3,
    selectedAIimageUrl3,
    selectedStickers3,
    isAIimage3,
    aimage3,
    letterSpacing3,
    lineHeight3
  } = useSlide3();
  return (
    <Box
      sx={{
        position: "relative",
        width: 485,
        height: "100%",
        overflow: "hidden",
        borderRadius: 2,
      }}
    >
      {selectedVideoUrl3 && (
        <Box
          sx={{
            position: "absolute", // use absolute like Rnd
            top: qrPosition3.y,
            left: qrPosition3.x,
            width: 300,       // ✅ match the image width
            height: 200,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "center",
            zIndex: qrPosition3.zIndex || 1,
          }}
        >
          {/* Background Image */}
          <Box
            component="img"
            src="/assets/images/video-qr-tips.png"
            sx={{
              width: 300,       // ✅ match the image width
              height: 200,
              objectFit: "fill",
              borderRadius: "6px",
            }}
          />

          {/* QR Code */}
          <Box
            sx={{
              position: "absolute",
              top: 50,
              height: 10,
              width: 15,
              left: { md: 2, sm: 27, xs: 25 },
              borderRadius: 2,
            }}
          >
            <QrGenerator
              url={qrPosition3.url || selectedVideoUrl3}
              size={Math.min(68, 75)}
            />
          </Box>

          {/* Clickable Link */}
          <a
            href={`${selectedVideoUrl3}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography
              sx={{
                position: "absolute",
                top: 78,
                right: { md: 0, sm: 30, xs: 30 },
                zIndex: 99,
                color: "black",
                fontSize: "10px",
                width: "105px",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {`${selectedVideoUrl3?.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {selectedAudioUrl3 && (
      <Box
          sx={{
            position: "absolute", // use absolute like Rnd
            top: qrAudioPosition3.y,
            left: qrAudioPosition3.x,
            width: 300,       // ✅ match the image width
            height: 200,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "center",
            zIndex: qrAudioPosition3.zIndex || 1,
          }}
        >
          {/* Background Image */}
          <Box
            component="img"
            src="/assets/images/video-qr-tips.png"
            sx={{
              width: 300,       // ✅ match the image width
              height: 200,
              objectFit: "fill",
              borderRadius: "6px",
            }}
          />

          {/* QR Code */}
          <Box
            sx={{
              position: "absolute",
              top: 50,
              height: 10,
              width: 15,
              left: { md: 2, sm: 27, xs: 25 },
              borderRadius: 2,
            }}
          >
            <QrGenerator
              url={qrAudioPosition3.url || selectedAudioUrl3}
              size={Math.min(68, 75)}
            />
          </Box>

          {/* Clickable Link */}
          <a
            href={`${selectedAudioUrl3}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Typography
              sx={{
                position: "absolute",
                top: 78,
                right: { md: 0, sm: 30, xs: 30 },
                zIndex: 99,
                color: "black",
                fontSize: "10px",
                width: "105px",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {`${selectedAudioUrl3?.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {/* 🖼️ Only selected images */}
      {draggableImages3
        .filter((img: any) => selectedImg3?.includes(img.id))
        .sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0))
        .map((img: any) => (
          <Box
            key={img.id}
            component="img"
            src={img.src}
            sx={{
              position: "absolute", // ✅ critical for proper placement
              width: img.width,
              height: img.height,
              left: img.x,
              top: img.y,
              transform: `rotate(${img.rotation || 0}deg)`, // ✅ rotation applied
              transformOrigin: "center center", // ✅ rotate around middle
              borderRadius: 2,
              objectFit: "cover",
              zIndex: img.zIndex || 1,
            }}
          />
        ))}

      {multipleTextValue3 &&
        texts3.map((e, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              height: { md: 210, sm: "175px", xs: "175px" }, // ✅ match editable container height
              width: "100%",
              mb: 2,
              display: "flex",
              justifyContent:
                e.verticalAlign === "top"
                  ? "flex-start"
                  : e.verticalAlign === "center"
                    ? "center"
                    : "flex-end",
              alignItems: "center",
              border: "3px dashed transparent", // ✅ visually matches editable version but invisible
              borderRadius: "6px",
              p: 1,
            }}
          >
            <Typography
              sx={{
                textAlign: e.textAlign,
                fontSize: e.fontSize3,
                fontWeight: e.fontWeight3,
                color: e.fontColor3,
                fontFamily: e.fontFamily3,
                lineHeight: e.lineHeight,
                letterSpacing: e.letterSpacing,
                wordBreak: "break-word",
                whiteSpace: "pre-line",
                width: "100%",
                height: "80%",
                display: "flex",
                alignItems:
                  e.verticalAlign === "top"
                    ? "flex-start"
                    : e.verticalAlign === "bottom"
                      ? "flex-end"
                      : "center",
                justifyContent:
                  e.textAlign === "left"
                    ? "flex-start"
                    : e.textAlign === "right"
                      ? "flex-end"
                      : "center",
                m: "auto",
              }}
            >
              {e.value}
            </Typography>
          </Box>
        ))}

      {/* 📝 Single Text Layout */}
      {selectedLayout3 === "oneText" && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent:
              verticalAlign3 === "top"
                ? "flex-start"
                : verticalAlign3 === "center"
                  ? "center"
                  : "flex-end",
            alignItems:
              textAlign3 === "start"
                ? "flex-start"
                : textAlign3 === "center"
                  ? "center"
                  : "flex-end",
            height: "100%",
            width: "100%",
            color: fontColor3,
            lineHeight: lineHeight3,
            letterSpacing: letterSpacing3,
            fontFamily3,
            fontSize3,
            fontWeight3,
            textAlign3, // ✅ still needed for multiline/inline text
            whiteSpace: "pre-wrap",
            p: 1,
          }}
        >
          {oneTextValue3}
        </Box>
      )}

      {
        multipleTextValue3 && selectedLayout3 === "oneText" ? null : (
          <>
            {textElements3 &&
              textElements3.map((e) => (
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
                    whiteSpace: "pre-line", // ⭐ FIX: Show line breaks
                    cursor: "text",
                  }}
                >
                  {e.value}
                </Typography>
              ))}</>
        )
      }

      {isAIimage3 && (
        <img
          src={`${selectedAIimageUrl3}`}
          alt="AIimage"
          style={{
            position: "absolute", // 👈 so it can use top/left
            left: aimage3.x, // 👈 saved x position
            top: aimage3.y, // 👈 saved y position
            width: `${aimage3.width}px`, // 👈 saved width
            height: `${aimage3.height}px`, // 👈 saved height
            objectFit: "fill",
            zIndex: 10,
            pointerEvents: "none", // 👈 prevents accidental clicking
          }}
        />
      )}

      {/* 🧷 Preview Stickers */}
      {selectedStickers3.map((sticker) => (
        <Box
          key={sticker.id}
          component="img"
          src={sticker.sticker}
          sx={{
            position: "absolute",
            left: sticker.x, // 👈 position
            top: sticker.y, // 👈 position
            width: `${sticker.width}px`, // 👈 width
            height: `${sticker.height}px`, // 👈 height
            objectFit: "contain",
            zIndex: sticker.zIndex,
            transform: `rotate(${sticker.rotation || 0}deg)`,
            pointerEvents: "none", // so it can’t be clicked
          }}
        />
      ))}
    </Box>
  );
};

export default Slide3;

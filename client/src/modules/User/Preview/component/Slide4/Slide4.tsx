import { useSlide4 } from "../../../../../context/Slide4Context";
import { Box, Typography } from "@mui/material";
import QrGenerator from "../../../../../components/QR-code/Qrcode";

const Slide4 = () => {
  const {
    texts4,
    oneTextValue4,
    multipleTextValue4,
    draggableImages4,
    fontColor4,
    fontFamily4,
    fontSize4,
    fontWeight4,
    selectedImg4,
    verticalAlign4,
    selectedVideoUrl4,
    qrPosition4,
    textAlign4,
    selectedLayout4,
    selectedAudioUrl4,
    qrAudioPosition4,
    textElements4,
    selectedAIimageUrl4,
    selectedStickers4,
    isAIimage4,
    aimage4,

    lineHeight4,
    letterSpacing4
  } = useSlide4();

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      {selectedVideoUrl4 && (
        <Box
          sx={{
            position: "absolute", // use absolute like Rnd
            top: qrPosition4.y,
            left: qrPosition4.x,
            width: "100%",
            height: 180,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "center",
            zIndex: qrPosition4.zIndex || 1,
          }}
        >
          {/* Background Image */}
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

          {/* QR Code */}
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
            <QrGenerator
              url={qrPosition4.url || selectedVideoUrl4}
              size={Math.min(qrPosition4.width, qrPosition4.height)}
            />
          </Box>

          {/* Clickable Link */}
          <a
            href={`${selectedVideoUrl4}`}
            target="_blank"
            rel="noopener noreferrer"
          >
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
              {`${selectedVideoUrl4.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {selectedAudioUrl4 && (
        <Box
          sx={{
            position: "absolute", // use absolute like Rnd
            top: qrAudioPosition4.y,
            left: qrAudioPosition4.x,
            width: "100%",
            height: 190,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "center",
            zIndex: qrAudioPosition4.zIndex || 1,
          }}
        >
          {/* Background Image */}
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

          {/* QR Code */}
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
            <QrGenerator
              url={qrAudioPosition4.url || selectedAudioUrl4}
              size={Math.min(qrAudioPosition4.width, qrAudioPosition4.height)}
            />
          </Box>

          {/* Clickable Link */}
          <a
            href={`${selectedAudioUrl4}`}
            target="_blank"
            rel="noopener noreferrer"
          >
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
              {`${selectedAudioUrl4.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {/* 🖼️ Only selected images */}
      {draggableImages4
        .filter((img: any) => selectedImg4?.includes(img.id))
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

      {multipleTextValue4 &&
        texts4.map((e, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              height: "175px",
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
              border: "3px dashed transparent",
              borderRadius: "6px",
              p: 1,
            }}
          >
            <Typography
              sx={{
                textAlign: e.textAlign,
                fontSize: e.fontSize4,
                fontWeight: e.fontWeight4,
                color: e.fontColor4,
                fontFamily: e.fontFamily4,
                lineHeight: lineHeight4,
                letterSpacing: letterSpacing4,
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
      {selectedLayout4 === "oneText" && (
        <Box
          sx={{
            // position: "absolute",
            display: "flex",
            alignItems:
              verticalAlign4 === "top"
                ? "flex-start"
                : verticalAlign4 === "center"
                  ? "center"
                  : "flex-end",
            justifyContent:
              verticalAlign4 === "top"
                ? "flex-start"
                : verticalAlign4 === "center"
                  ? "center"
                  : "flex-end",
            height: "100%",
            color: fontColor4,
            fontFamily: fontFamily4,
            fontSize: fontSize4,
            fontWeight: fontWeight4,
            textAlign: textAlign4,
            lineHeight: lineHeight4,
            letterSpacing: letterSpacing4,
            whiteSpace: "pre-wrap",
            width: "100%",
            p: 1
          }}
        >
          {oneTextValue4}
        </Box>
      )}

      {
        multipleTextValue4 || selectedLayout4 === "oneText" ? null : (
          <>
            {textElements4 &&
              textElements4.map((e) => (
                <Typography
                  key={e.id}
                  sx={{
                    fontSize: e.fontSize,
                    color: e.fontColor,
                    fontFamily: e.fontFamily,
                    fontWeight: e.fontWeight,
                    textAlign: e.textAlign || "center",
                    position: "absolute", // Use absolute positioning
                    left: e.position.x, // X position
                    top: e.position.y, // Y position
                    width: e.size.width, // Width from size object
                    height: e.size.height, // Height from size object
                    zIndex: e.zIndex, // Apply zIndex
                    transform: `rotate(${e.rotation}deg)`, // Apply rotation
                    padding: "5px",
                    boxSizing: "border-box",
                  }}
                >
                  {e.value} {/* Display the text value */}
                </Typography>
              ))}</>
        )
      }

      {isAIimage4 && (
        <img
          src={`${selectedAIimageUrl4}`}
          alt="AIimage"
          style={{
            position: "absolute",
            left: aimage4.x,
            top: aimage4.y,
            width: `${aimage4.width}px`,
            height: `${aimage4.height}px`,
            objectFit: "fill",
            zIndex: 10,
            pointerEvents: "none", // 👈
          }}
        />
      )}

      {/* 🧷 Preview Stickers */}
      {selectedStickers4.map((sticker) => (
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
            transform: `rotate(${sticker.rotation || 0}deg)`, // rotaion for sticker
            pointerEvents: "none", // so it can’t be clicked
          }}
        />
      ))}
    </Box>
  );
};

export default Slide4;

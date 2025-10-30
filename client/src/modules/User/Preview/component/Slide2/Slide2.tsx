import { Box, Typography } from "@mui/material";
import { useSlide2 } from "../../../../../context/Slide2Context";
import QrGenerator from "../../../../../components/QR-code/Qrcode";

const Slide2 = () => {
  const {
    texts,
    oneTextValue,
    multipleTextValue,
    draggableImages,
    fontColor,
    fontFamily,
    fontSize,
    fontWeight,
    selectedImg,
    verticalAlign,
    selectedVideoUrl,
    selectedAudioUrl,
    qrPosition,
    textAlign,
    selectedLayout,
    textElements,
    qrAudioPosition,
    selectedAIimageUrl2,
    selectedStickers2,
    isAIimage2,
    aimage2,
  } = useSlide2();

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {selectedVideoUrl && (
        <Box
          sx={{
            position: "absolute", // use absolute like Rnd
            top: qrPosition.y,
            left: qrPosition.x,
            width: "100%",
            height: 180,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "center",
            zIndex: qrPosition.zIndex || 1,
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
              url={qrPosition.url || selectedVideoUrl}
              size={Math.min(qrPosition.width, qrPosition.height)}
            />
          </Box>

          {/* Clickable Link */}
          <a
            href={`${selectedVideoUrl}`}
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
              {`${selectedVideoUrl.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {selectedAudioUrl && (
        <Box
          sx={{
            position: "absolute", // use absolute like Rnd
            top: qrAudioPosition.y,
            left: qrAudioPosition.x,
            width: "100%",
            height: 190,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            textAlign: "center",
            zIndex: qrAudioPosition.zIndex || 1,
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
              url={qrAudioPosition.url || selectedAudioUrl}
              size={Math.min(qrAudioPosition.width, qrAudioPosition.height)}
            />
          </Box>

          {/* Clickable Link */}
          <a
            href={`${selectedAudioUrl}`}
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
              {`${selectedAudioUrl.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {/* 🖼️ Only selected images */}
      {draggableImages
        .filter((img: any) => selectedImg?.includes(img.id))
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

       {multipleTextValue &&
        texts.map((e, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
             height: "175px", // ✅ match editable container height
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
                fontSize: e.fontSize1,
                fontWeight: e.fontWeight,
                color: e.fontColor,
                fontFamily: e.fontFamily,
                lineHeight: 1.4,
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
      {selectedLayout === "oneText" && (
        <Box
          sx={{
            // position: "absolute",
            display: "flex",
            alignItems:
              verticalAlign === "top"
                ? "flex-start"
                : verticalAlign === "center"
                ? "center"
                : "flex-end",
            justifyContent:
              verticalAlign === "top"
                ? "flex-start"
                : verticalAlign === "center"
                ? "center"
                : "flex-end",
            height: "100%",
            color: fontColor,
            fontFamily,
            fontSize,
            fontWeight,
            textAlign,
            whiteSpace: "pre-wrap",
            width: "100%",
          }}
        >
          {oneTextValue}
        </Box>
      )}

      {textElements &&
        textElements.map((e) => (
          <Typography
            key={e.id}
            sx={{
              border: "1px dashed blue",
              fontSize: e.fontSize,
              color: e.fontColor,
              fontFamily: e.fontFamily,
              fontWeight: e.fontWeight,
              textAlign: e.textAlign || "center",
              position: "absolute", // Use absolute positioning
              left: e.position.x, // X position
              top: e.position.y, // Y position
              width: e.size.width, // Width from size object
              height: "auto", // Height from size object
              zIndex: e.zIndex, // Apply zIndex
              transform: `rotate(${e.rotation}deg)`, // Apply rotation
              padding: "5px",
              boxSizing: "border-box",
            }}
          >
            {e.value} {/* Display the text value */}
          </Typography>
        ))}

      {isAIimage2 && (
        <img
          src={`${selectedAIimageUrl2}`}
          alt="AIimage"
          style={{
            position: "absolute", // 👈 so it can use top/left
            left: aimage2.x, // 👈 saved x position
            top: aimage2.y, // 👈 saved y position
            width: `${aimage2.width}px`, // 👈 saved width
            height: `${aimage2.height}px`, // 👈 saved height
            objectFit: "fill",
            // zIndex: 10,
            pointerEvents: "none", // 👈 prevents accidental clicking
          }}
        />
      )}
      {/* 🧷 Preview Stickers */}
      {selectedStickers2.map((sticker) => (
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

export default Slide2;

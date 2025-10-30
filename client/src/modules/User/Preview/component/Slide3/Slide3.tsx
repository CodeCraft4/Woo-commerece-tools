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
  } = useSlide3();
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
      {selectedVideoUrl3 && (
        <Box
          sx={{
            position: "absolute", // use absolute like Rnd
            top: qrPosition3.y,
            left: qrPosition3.x,
            width: "100%",
            height: 180,
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
              url={qrPosition3.url || selectedVideoUrl3}
              size={Math.min(qrPosition3.width, qrPosition3.height)}
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
              {`${selectedVideoUrl3.slice(0, 20)}.....`}
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
            width: "100%",
            height: 190,
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
              url={qrAudioPosition3.url || selectedAudioUrl3}
              size={Math.min(qrAudioPosition3.width, qrAudioPosition3.height)}
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
              {`${selectedAudioUrl3.slice(0, 20)}.....`}
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
                fontSize: e.fontSize3,
                fontWeight: e.fontWeight3,
                color: e.fontColor3,
                fontFamily: e.fontFamily3,
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
      {selectedLayout3 === "oneText" && (
        <Box
          sx={{
            // position: "absolute",
            display: "flex",
            alignItems:
              verticalAlign3 === "top"
                ? "flex-start"
                : verticalAlign3 === "center"
                ? "center"
                : "flex-end",
            justifyContent:
              verticalAlign3 === "top"
                ? "flex-start"
                : verticalAlign3 === "center"
                ? "center"
                : "flex-end",
            height: "100%",
            color: fontColor3,
            fontFamily3,
            fontSize3,
            fontWeight3,
            textAlign3,
            whiteSpace: "pre-wrap",
            width: "100%",
          }}
        >
          {oneTextValue3}
        </Box>
      )}

      {/* ✍️ Multiple Text Layout */}
      {selectedLayout3 === "multipleText" && texts3.length > 0 && (
        <Box
          sx={{
            height: "100%",
            width: "375px",
            borderRadius: "6px",
            p: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {texts3.map((textObj: any, index: number) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                height: "175px",
                width: "100%",
                mb: 2,
                display: "flex",
                justifyContent:
                  textObj.verticalAlign3 === "top"
                    ? "flex-start"
                    : textObj.verticalAlign3 === "center"
                    ? "center"
                    : "flex-end",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: textObj.fontSize3,
                  fontWeight: textObj.fontWeight3,
                  color: textObj.fontColor3,
                  fontFamily: textObj.fontFamily3,
                  lineHeight: 1.4,
                  wordBreak: "break-word",
                  whiteSpace: "pre-line",
                  border: "3px dashed #3a7bd5",
                  borderRadius: "6px",
                  width: "100%",
                  p: 1,
                }}
              >
                {textObj.value || "Add Text"}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {textElements3 &&
        textElements3.map((e) => (
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

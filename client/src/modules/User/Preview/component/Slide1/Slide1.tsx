import { useSlide1 } from "../../../../../context/Slide1Context";
import { Box, Typography } from "@mui/material";
import QrGenerator from "../../../../../components/QR-code/Qrcode";

const Slide1 = () => {
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
    qrPosition1,
    selectedLayout1,
    selectedAudioUrl1,
    qrAudioPosition1,
    textElements1,
    selectedAIimageUrl1,
    selectedStickers,
    isAIimage,
    aimage1,
    layout1,
    lineHeight1,
    letterSpacing1
  } = useSlide1();

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >

      {layout1 && (
        <Box sx={{ width: "100%", height: "100%", position: "relative", p: 1 }}>
          {/* Render Images */}
          {layout1?.elements.map((el: any) => (
            <Box
              key={el.id}
              sx={{
                position: "absolute",
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                borderRadius: 1,
                overflow: "hidden",
                zIndex: el.zIndex || 1,
              }}
            >
              <Box
                component="img"
                src={el.src}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 1,
                }}
              />
            </Box>
          ))}

          {/* Render Texts */}
          {layout1.textElements.map((te: any) => {
            // Horizontal alignment map
            const hAlign =
              te.textAlign === "left"
                ? "flex-start"
                : te.textAlign === "right"
                  ? "flex-end"
                  : "center";

            const vAlign =
              te.verticalAlign === "top"
                ? "flex-start"
                : te.verticalAlign === "bottom"
                  ? "flex-end"
                  : "center";


            return (
              <Box
                key={te.id}
                sx={{
                  position: "absolute",
                  left: te.x,
                  top: te.y,
                  width: te.width,
                  height: te.height,
                  display: "flex",
                  justifyContent: hAlign,
                  alignItems: vAlign,

                  // ✅ Font and style properties (directly from DB or user changes)
                  color: te.color || "#000",
                  fontSize: te.fontSize || 16,
                  fontFamily: te.fontFamily || "Roboto, sans-serif",
                  fontWeight: te.bold ? 700 : te.fontWeight || 400,
                  fontStyle: te.italic ? "italic" : "normal",
                  textTransform: te.uppercase ? "uppercase" : "none",

                  // ✅ Layout and alignment
                  textAlign: te.textAlign || "center",
                  lineHeight: 1.2,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",

                  // ✅ Rotation & layer
                  transform: `rotate(${te.rotation || 0}deg)`,
                  transformOrigin: "center center",
                  zIndex: te.zIndex || 2,
                  pointerEvents: "none", // avoid selection in preview
                }}
              >
                {te.text || ""}
              </Box>
            );
          })}
        </Box>
      )}


      {selectedVideoUrl1 && (
        <Box
          sx={{
            position: "absolute", // use absolute like Rnd
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
              left: 57,
              borderRadius: 2,
            }}
          >
            <QrGenerator
              url={qrPosition1.url || selectedVideoUrl1}
              size={Math.min(qrPosition1.width, qrPosition1.height)}
            />
          </Box>

          {/* Clickable Link */}
          <a
            href={`${selectedVideoUrl1}`}
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
              {`${selectedVideoUrl1.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {selectedAudioUrl1 && (
        <Box
          sx={{
            position: "absolute", // use absolute like Rnd
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
              left: 64,
              borderRadius: 2,
            }}
          >
            <QrGenerator
              url={qrAudioPosition1.url || selectedAudioUrl1}
              size={Math.min(qrAudioPosition1.width, qrAudioPosition1.height)}
            />
          </Box>

          {/* Clickable Link */}
          <a
            href={`${selectedAudioUrl1}`}
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
              {`${selectedAudioUrl1.slice(0, 20)}.....`}
            </Typography>
          </a>
        </Box>
      )}

      {/* 🖼️ Only selected images */}
      {draggableImages1
        .filter((img: any) => selectedImg1?.includes(img.id))
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

      {multipleTextValue1 &&
        texts1.map((e, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              height: "175px", // ✅ match editable container height
              width: "100%",
              mb: 2,
              borderRadius: "6px",
              display: "flex",
              justifyContent: "center",
              alignItems:
                e.verticalAlign === "top"
                  ? "flex-start"
                  : e.verticalAlign === "center"
                    ? "center"
                    : "flex-end",
              p: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: e.fontSize1,
                fontWeight: e.fontWeight1,
                color: e.fontColor1,
                fontFamily: e.fontFamily1,
                textAlign: e.textAlign,
                width: "100%",
                height: "100%",
                wordBreak: "break-word",
                whiteSpace: "pre-line",
                display: "flex",
                alignItems:
                  e.verticalAlign === "top"
                    ? "flex-start"
                    : e.verticalAlign === "bottom"
                      ? "flex-end"
                      : "center",
                justifyContent:
                  e.textAlign1 === "left"
                    ? "flex-start"
                    : e.textAlign1 === "right"
                      ? "flex-end"
                      : "center",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                lineHeight: e.lineHeight,
                letterSpacing: e.letterSpacing,
              }}
            >
              {e.value?.length === 0 ? (
                <Typography
                  sx={{
                    color: "gray",
                    fontStyle: "italic",
                    opacity: 0.6,
                  }}
                >
                  (Empty)
                </Typography>
              ) : (
                e.value
              )}
            </Typography>
          </Box>
        ))}

      {/* 📝 Single Text Layout */}
      {selectedLayout1 === "oneText" && (
        <Box
          sx={{
            // position: "absolute",
            display: "flex",
            alignItems:
              verticalAlign1 === "top"
                ? "flex-start"
                : verticalAlign1 === "center"
                  ? "center"
                  : "flex-end",
            justifyContent:
              verticalAlign1 === "top"
                ? "flex-start"
                : verticalAlign1 === "center"
                  ? "center"
                  : "flex-end",
            height: "100%",
            color: fontColor1,
            fontFamily: fontFamily1,
            fontSize: fontSize1,
            fontWeight: fontWeight1,
            lineHeight: lineHeight1,
            letterSpacing: letterSpacing1,
            whiteSpace: "pre-wrap",
            width: "100%",
            p: 1
          }}
        >
          {oneTextValue1}
        </Box>
      )}

      {
        multipleTextValue1 || selectedLayout1 === "oneText" ? null : (
          <>
            {textElements1 &&
              textElements1.map((e) => (
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

      {isAIimage && (
        <img
          src={`${selectedAIimageUrl1}`}
          alt="AIimage"
          style={{
            position: "absolute", // 👈 so it can use top/left
            left: aimage1.x, // 👈 saved x position
            top: aimage1.y, // 👈 saved y position
            width: `${aimage1.width}px`, // 👈 saved width
            height: `${aimage1.height}px`, // 👈 saved height
            objectFit: "fill",
            zIndex: 10,
            pointerEvents: "none", // 👈 prevents accidental clicking
          }}
        />
      )}

      {/* 🧷 Preview Stickers */}
      {selectedStickers.map((sticker) => (
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

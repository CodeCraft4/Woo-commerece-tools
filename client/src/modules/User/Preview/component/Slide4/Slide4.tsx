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
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            m: "auto",
            width: "100%",
            textAlign: "center",
            // height: "100%",
            top: qrPosition4.y,
            height: qrPosition4.height,
            // bottom: 0,
            flex: 1,
          }}
        >
          <Box
            component={"img"}
            src="/assets/images/QR-tips.jpg"
            sx={{
              width: "100%",
              height: 200,
              position: "relative",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 46,
              height: 100,
              width: 100,
              borderRadius: 2,
              ml: "10px",
              // bgcolor:'red',
              p: 1,
            }}
          >
            <QrGenerator
              url={qrPosition4.url || selectedVideoUrl4}
              size={Math.min(qrPosition4.width, qrPosition4.height)}
            />
          </Box>
        </Box>
      )}

      {selectedAudioUrl4 && (
        <Box
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            m: "auto",
            width: "100%",
            textAlign: "center",
            height: "100%",
            bottom: 0,
            flex: 1,
          }}
        >
          <Box
            component={"img"}
            src="/assets/images/QR-tips.jpg"
            sx={{
              width: "100%",
              height: 200,
              position: "relative",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 46,
              height: 100,
              width: 100,
              borderRadius: 2,
              ml: "10px",
              // bgcolor:'red',
              p: 1,
            }}
          >
            <QrGenerator
              url={qrAudioPosition4.url || selectedAudioUrl4}
              size={Math.min(qrAudioPosition4.width, qrAudioPosition4.height)}
            />
          </Box>
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
        texts4.map((e) => (
          <Box
            key={e}
            sx={{
              position: "relative",
              height: "160px",
              width: "100%",
              mb: 2,
              display: "flex",
              justifyContent:
                e.verticalAlign4 === "top"
                  ? "flex-start"
                  : e.verticalAlign4 === "center"
                  ? "center"
                  : "flex-end",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                textAlign: "center",
                fontSize: e.fontSize4,
                fontWeight: e.fontWeight4,
                color: e.fontColor4,
                fontFamily: e.fontFamily4,
                lineHeight: 1.4,
                wordBreak: "break-word",
                whiteSpace: "pre-line",
                // border: "3px dashed #3a7bd5",
                borderRadius: "6px",
                width: "100%",
                height: "80%",
                dipslay: "flex",
                alignItems: "center",
                m: "auto",
                justifyContent:
                  e.verticalAlign4 === "top"
                    ? "flex-start"
                    : e.verticalAlign4 === "center"
                    ? "center"
                    : "flex-end",
                p: 1,
              }}
            >
              {e.value || "Add Text"}
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
            fontFamily4,
            fontSize4,
            fontWeight4,
            textAlign4,
            whiteSpace: "pre-wrap",
            width: "100%",
          }}
        >
          {oneTextValue4}
        </Box>
      )}

      {/* ✍️ Multiple Text Layout */}
      {selectedLayout4 === "multipleText" && texts4.length > 0 && (
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
          {texts4.map((textObj: any, index: number) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                height: "175px",
                width: "100%",
                mb: 2,
                display: "flex",
                justifyContent:
                  textObj.verticalAlign4 === "top"
                    ? "flex-start"
                    : textObj.verticalAlign4 === "center"
                    ? "center"
                    : "flex-end",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: textObj.fontSize4,
                  fontWeight: textObj.fontWeight4,
                  color: textObj.fontColor4,
                  fontFamily: textObj.fontFamily4,
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

      {textElements4 &&
        textElements4.map((e) => (
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

      {isAIimage4 && (
        <img
          src={`${selectedAIimageUrl4}`}
          alt="AIimage"
          style={{
            position: "absolute", // 👈 so it can use top/left
            left: aimage4.x, // 👈 saved x position
            top: aimage4.y, // 👈 saved y position
            width: `${aimage4.width}px`, // 👈 saved width
            height: `${aimage4.height}px`, // 👈 saved height
            objectFit: "contain",
            zIndex: 10,
            pointerEvents: "none", // 👈 prevents accidental clicking
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

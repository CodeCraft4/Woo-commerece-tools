import { useSlide1 } from "../../../../../context/Slide1Context";
import { Box } from "@mui/material";

const Slide1 = () => {
  const {
    layout1,
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
          {layout1.textElements?.map((te: any) => {
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

          {layout1.stickers?.map((el: any) => (
            <Box
              key={el.id}
              sx={{
                position: "absolute",
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                borderRadius: 1,
                zIndex: el.zIndex || 50,
                pointerEvents: "none",
              }}
            >
              <Box
                component="img"
                src={el.sticker}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: 1,
                  zIndex: el.zIndex || 50,
                }}
              />
            </Box>
          ))}

        </Box>
      )}
    </Box>
  );
};

export default Slide1;

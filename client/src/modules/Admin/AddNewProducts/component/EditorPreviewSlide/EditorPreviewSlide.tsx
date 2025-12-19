import { forwardRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import QrGenerator from "../../../../../components/QR-code/Qrcode";

type Ctx = any;

type Props = {
    width?: number;
    height?: number;
    ctx: Ctx; // pass useSlideX() result here
};

const get = (o: any, k: string, d?: any) => (o && o[k] !== undefined ? o[k] : d);

const EditorPreviewSlide = forwardRef<HTMLDivElement, Props>(({ width = 500, height = 700, ctx }, ref) => {
    const bgImage = get(ctx, "bgImage1") ?? get(ctx, "bgImage") ?? null;
    const bgColor = get(ctx, "bgColor1") ?? get(ctx, "bgColor") ?? "#fff";

    const multipleText = !!(get(ctx, "multipleTextValue1") ?? get(ctx, "multipleTextValue"));
    const texts = get(ctx, "texts1") ?? get(ctx, "texts") ?? [];
    const showOneText = !!(get(ctx, "showOneTextRightSideBox1") ?? get(ctx, "showOneTextRightSideBox"));
    const oneTextValue = get(ctx, "oneTextValue1") ?? get(ctx, "oneTextValue") ?? "";
    const fontSize = get(ctx, "fontSize1") ?? get(ctx, "fontSize");
    const fontWeight = get(ctx, "fontWeight1") ?? get(ctx, "fontWeight");
    const fontColor = get(ctx, "fontColor1") ?? get(ctx, "fontColor");
    const fontFamily = get(ctx, "fontFamily1") ?? get(ctx, "fontFamily");
    const textAlign = get(ctx, "textAlign1") ?? get(ctx, "textAlign") ?? "center";
    const verticalAlign = get(ctx, "verticalAlign1") ?? get(ctx, "verticalAlign") ?? "center";
    const rotation = get(ctx, "rotation1") ?? get(ctx, "rotation") ?? 0;
    const lineHeight = get(ctx, "lineHeight1") ?? get(ctx, "lineHeight");
    const letterSpacing = get(ctx, "letterSpacing1") ?? get(ctx, "letterSpacing");

    const draggables = get(ctx, "draggableImages1") ?? get(ctx, "draggableImages") ?? [];
    const selectedImg = get(ctx, "selectedImg1") ?? get(ctx, "selectedImg") ?? [];
    const stickers = get(ctx, "selectedStickers1") ?? get(ctx, "selectedStickers") ?? [];

    const videoUrl = get(ctx, "selectedVideoUrl1") ?? get(ctx, "selectedVideoUrl") ?? null;
    const qrVideo = get(ctx, "qrPosition1") ?? get(ctx, "qrPosition") ?? {};
    const audioUrl = get(ctx, "selectedAudioUrl1") ?? get(ctx, "selectedAudioUrl") ?? null;
    const qrAudio = get(ctx, "qrAudioPosition1") ?? get(ctx, "qrAudioPosition") ?? {};

    const isAI = !!(get(ctx, "isAIimage1") ?? get(ctx, "isAIimage"));
    const ai = get(ctx, "aimage1") ?? get(ctx, "aimage") ?? null;
    const aiUrl = get(ctx, "selectedAIimageUrl1") ?? get(ctx, "selectedAIimageUrl") ?? null;

    return (
        <Box
            ref={ref}
            sx={{
                width, height,
                position: "relative",
                overflow: "hidden",
                borderRadius: "12px",
                boxShadow: "3px 5px 8px rgba(0,0,0,0.25)",
                backgroundColor: bgImage ? "transparent" : bgColor ?? "#fff",
                backgroundImage: bgImage ? `url(${bgImage})` : "none",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                pointerEvents: "none",
                userSelect: "none",
            }}
        >
            {showOneText && (
                <Box sx={{
                    position: "absolute", inset: 0, display: "flex",
                    justifyContent: verticalAlign === "top" ? "flex-start" : verticalAlign === "bottom" ? "flex-end" : "center",
                    alignItems: textAlign === "start" ? "flex-start" : textAlign === "end" ? "flex-end" : "center", px: 2
                }}>
                    <Typography sx={{
                        fontSize, fontWeight, color: fontColor, fontFamily,
                        textAlign: textAlign as any,
                        transform: `rotate(${rotation || 0}deg)`,
                        lineHeight, letterSpacing, whiteSpace: "pre-wrap", wordBreak: "break-word", width: "100%",
                    }}>
                        {oneTextValue}
                    </Typography>
                </Box>
            )}

            {multipleText && texts?.map((t: any, i: number) => (
                <Box key={i} sx={{
                    position: "absolute", left: t.x ?? 0, top: t.y ?? i * 220,
                    width: t.width ?? "100%", height: t.height ?? 210, display: "flex",
                    alignItems: t.verticalAlign === "top" ? "flex-start" : t.verticalAlign === "bottom" ? "flex-end" : "center",
                    justifyContent: t.textAlign === "left" ? "flex-start" : t.textAlign === "right" ? "flex-end" : "center",
                    px: 1, zIndex: t.zIndex ?? 50
                }}>
                    <Typography sx={{
                        fontSize: t.fontSize1 ?? t.fontSize, fontWeight: t.fontWeight1 ?? t.fontWeight,
                        color: t.fontColor1 ?? t.fontColor, fontFamily: t.fontFamily1 ?? t.fontFamily,
                        textAlign: (t.textAlign ?? "center") as any, lineHeight: t.lineHeight ?? 1.4,
                        letterSpacing: t.letterSpacing ?? 0, width: "100%", whiteSpace: "pre-wrap", wordBreak: "break-word"
                    }}>{t.value}</Typography>
                </Box>
            ))}

            {Array.isArray(draggables) && draggables
                .filter((img: any) => Array.isArray(selectedImg) ? selectedImg.includes(img.id) : true)
                .map((img: any) => (
                    <Box key={img.id} sx={{
                        position: "absolute", left: img.x, top: img.y, width: img.width, height: img.height,
                        transform: `rotate(${img.rotation || 0}deg)`, transformOrigin: "center",
                        zIndex: img.zIndex ?? 1, overflow: "hidden", borderRadius: 1
                    }}>
                        <img src={img.src} alt="" style={{ width: "100%", height: "100%", objectFit: "fill", filter: img.filter || "none", clipPath: img.shapePath || "none" }} />
                    </Box>
                ))}

            {Array.isArray(stickers) && stickers.map((st: any, i: number) => (
                <Box key={st.id ?? `st-${i}`} sx={{
                    position: "absolute", left: st.x, top: st.y, width: st.width, height: st.height,
                    transform: `rotate(${st.rotation || 0}deg)`, transformOrigin: "center", zIndex: st.zIndex ?? 1
                }}>
                    <Box component="img" src={st.sticker} alt="" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </Box>
            ))}

            {videoUrl && (
                <Box sx={{
                    position: "absolute", left: qrVideo?.x || 0, top: qrVideo?.y || 0,
                    width: (qrVideo?.width || 120) + 40, height: 200, zIndex: qrVideo?.zIndex ?? 999, pointerEvents: "none"
                }}>
                    <Box component="img" src="/assets/images/video-qr-tips.png" alt="" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    <Box sx={{ position: "absolute", top: 55, left: 6, borderRadius: 2 }}>
                        <QrGenerator url={videoUrl} size={Math.min(qrVideo?.width || 120, qrVideo?.height || 120)} />
                    </Box>
                    <Typography sx={{ position: "absolute", top: 80, right: 15, fontSize: "10px", width: "105px", textAlign: "right" }}>
                        {(videoUrl || "").slice(0, 20)}.....
                    </Typography>
                    <IconButton size="small" sx={{ position: "absolute", top: 0, right: 0, bgcolor: "black", color: "white", width: 22, height: 22, pointerEvents: "none" }}>
                        <Close fontSize="inherit" />
                    </IconButton>
                </Box>
            )}

            {audioUrl && (
                <Box sx={{
                    position: "absolute", left: qrAudio?.x || 0, top: qrAudio?.y || 0,
                    width: (qrAudio?.width || 120) + 40, height: 200, zIndex: qrAudio?.zIndex ?? 999, pointerEvents: "none"
                }}>
                    <Box component="img" src="/assets/images/audio-qr-tips.png" alt="" sx={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    <Box sx={{ position: "absolute", top: 55, left: 6, borderRadius: 2 }}>
                        <QrGenerator url={audioUrl} size={Math.min(qrAudio?.width || 120, qrAudio?.height || 120)} />
                    </Box>
                    <Typography sx={{ position: "absolute", top: 78, right: 15, fontSize: "10px", width: "105px", textAlign: "right" }}>
                        {(audioUrl || "").slice(0, 20)}.....
                    </Typography>
                    <IconButton size="small" sx={{ position: "absolute", top: 0, right: 0, bgcolor: "black", color: "white", width: 22, height: 22, pointerEvents: "none" }}>
                        <Close fontSize="inherit" />
                    </IconButton>
                </Box>
            )}

            {isAI && ai && (
                <Box sx={{
                    position: "absolute", left: ai?.x ?? 0, top: ai?.y ?? 0,
                    width: ai?.width ?? 200, height: ai?.height ?? 200, zIndex: 10, overflow: "hidden", borderRadius: 1
                }}>
                    <Box component="img" src={String(aiUrl || "")} alt="AI" sx={{ width: "100%", height: "100%", objectFit: "fill" }} />
                </Box>
            )}
        </Box>
    );
});

export default EditorPreviewSlide;

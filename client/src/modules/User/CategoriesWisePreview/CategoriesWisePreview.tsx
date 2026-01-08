import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, Typography, useMediaQuery } from "@mui/material";
import { ArrowBackIos, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { toPng } from "html-to-image";
import { USER_ROUTES } from "../../../constant/route";

/* ---------- Types ---------- */
type BaseEl = { id: string; x: number; y: number; width: number; height: number; zIndex?: number; editable?: boolean };
type TextEl = BaseEl & {
    type: "text";
    text: string;
    bold: boolean;
    italic: boolean;
    color: string;
    fontSize: number;
    fontFamily: string;
    align?: "left" | "center" | "right";
};
type ImageEl = BaseEl & { type: "image"; src: string };
type StickerEl = BaseEl & { type: "sticker"; src: string };
type AnyEl = TextEl | ImageEl | StickerEl;
type Slide = { id: number; label: string; elements: AnyEl[] };

type ArtboardConfig = {
    mmWidth: number;
    mmHeight: number;
    slideLabels?: string[];
    maxWidth?: number;
    maxHeight?: number;
    fitCanvas?: { width: number; height: number }; // ✅ if you stored it in config
};

type NavState = {
    slides?: Slide[];
    config?: ArtboardConfig;
    canvasPx?: { w: number; h: number }; // ✅ you already pass this from editor
    slideIndex?: number;
    category?: string;

    // sometimes you might pass full templetDesign row (optional)
    templetDesign?: any;
};

/* ---------- Helpers ---------- */
const TRANSPARENT_PX =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

async function blobToDataURL(url: string): Promise<string | null> {
    try {
        const resp = await fetch(url);
        if (!resp.ok) return null;
        const blob = await resp.blob();
        return await new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result));
            fr.onerror = reject;
            fr.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

async function ensureDataUrls(slides: Slide[]): Promise<Slide[]> {
    const copy: Slide[] = JSON.parse(JSON.stringify(slides));
    await Promise.all(
        copy.flatMap((sl) =>
            sl.elements.map(async (el) => {
                if ((el.type === "image" || el.type === "sticker") && typeof (el as any).src === "string") {
                    const s = (el as ImageEl | StickerEl).src;
                    if (s?.startsWith("blob:")) {
                        const data = await blobToDataURL(s);
                        if (data) (el as ImageEl | StickerEl).src = data;
                    }
                }
            })
        )
    );
    return copy;
}

/* ---------- Slide DOM (base coords) ---------- */
const SlideView: React.FC<{ slide: Slide, captureRef?: any }> = ({ slide, captureRef }) => {
    const ordered = useMemo(
        () => [...slide.elements].sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1)),
        [slide.elements]
    );

    return (
        <Box ref={captureRef} sx={{ position: "relative", width: "100%", height: "100%" }}>
            {ordered.map((el) => {
                const style = {
                    position: "absolute" as const,
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    zIndex: el.zIndex ?? 1,
                };

                if (el.type === "image") {
                    const img = el as ImageEl;
                    return (
                        <Box key={el.id} sx={style}>
                            <img
                                src={img.src}
                                alt=""
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                crossOrigin="anonymous"
                                loading="eager"
                            />
                        </Box>
                    );
                }

                if (el.type === "sticker") {
                    const s = el as StickerEl;
                    return (
                        <Box
                            key={el.id}
                            component="img"
                            src={s.src}
                            alt=""
                            sx={{ ...style, objectFit: "contain", display: "block", pointerEvents: "none", userSelect: "none" }}
                        />
                    );
                }

                const t = el as TextEl;
                const align = t.align ?? "center";
                const justify =
                    align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

                return (
                    <Box key={el.id} sx={style}>
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: justify,
                                px: 1,
                                fontWeight: t.bold ? 700 : 400,
                                fontStyle: t.italic ? "italic" : "normal",
                                fontSize: `${t.fontSize}px`,
                                fontFamily: t.fontFamily || "inherit",
                                color: t.color,
                                // lineHeight: 1.2,
                                whiteSpace: "pre-wrap",
                                overflow: "hidden",
                                userSelect: "none",
                                textAlign: align as any,
                            }}
                        >
                            {t.text}
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
};

/* ---------- Component ---------- */
const CategoriesWisePreview: React.FC = () => {
    const { state } = useLocation() as { state?: NavState };
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:480px)");

    const config = state?.config;
    const start = state?.slideIndex ?? 0;

    const initialSlides = state?.slides ?? [];
    const [slides, setSlides] = useState<Slide[]>(initialSlides);
    const [active, setActive] = useState(start);

    // book animation
    const [flipDir, setFlipDir] = useState<"next" | "prev">("next");
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        (async () => setSlides(await ensureDataUrls(initialSlides)))();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!config || !slides.length) {
        return (
            <Box sx={{ height: "92vh", display: "grid", placeItems: "center" }}>
                <Typography>No preview data.</Typography>
            </Box>
        );
    }

    // ✅ preview viewport size
    const boxW = isMobile ? 320 : 480;
    const boxH = isMobile ? 440 : 680;

    // ✅ EXACT same logic as editor: coverScale
    // const fit = useMemo(() => coverScale(baseW, baseH, boxW, boxH), [baseW, baseH, boxW, boxH]);

    const slideCount = slides.length;

    const goNext = () => {
        if (active >= slideCount - 1 || flipping) return;
        setFlipDir("next");
        setFlipping(true);
        setTimeout(() => {
            setActive((p) => Math.min(p + 1, slideCount - 1));
            setTimeout(() => setFlipping(false), 50);
        }, 260);
    };

    const goPrev = () => {
        if (active <= 0 || flipping) return;
        setFlipDir("prev");
        setFlipping(true);
        setTimeout(() => {
            setActive((p) => Math.max(p - 1, 0));
            setTimeout(() => setFlipping(false), 50);
        }, 260);
    };

    // capture / download
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [downloading, setDownloading] = useState(false);

    async function captureNode(node: HTMLElement, w: number, h: number) {
        try { await (document as any).fonts?.ready; } catch { }

        const clone = node.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("img").forEach((img) => {
            img.setAttribute("crossorigin", "anonymous");
            (img as HTMLImageElement).decoding = "sync";
            (img as HTMLImageElement).loading = "eager";
        });

        const sandbox = document.createElement("div");
        sandbox.style.position = "fixed";
        sandbox.style.left = "-10000px";
        sandbox.style.top = "-10000px";
        sandbox.style.width = `${w}px`;
        sandbox.style.height = `${h}px`;
        sandbox.style.pointerEvents = "none";
        sandbox.appendChild(clone);
        document.body.appendChild(sandbox);

        clone.style.width = `${w}px`;
        clone.style.height = `${h}px`;
        clone.style.transform = "none";

        try {
            return await toPng(clone, {
                cacheBust: true,
                backgroundColor: "#ffffff",
                pixelRatio: 2,
                width: w,
                height: h,
                imagePlaceholder: TRANSPARENT_PX,
                style: { width: `${w}px`, height: `${h}px`, transform: "none" },
            });
        } finally {
            sandbox.remove();
        }
    }

    async function captureAllPreviews(): Promise<string[]> {
        const out: string[] = [];
        const CAP_W = boxW;
        const CAP_H = boxH;

        for (let i = 0; i < slideCount; i++) {
            setActive(i);
            await new Promise<void>((r) => requestAnimationFrame(() => r()));
            if (previewRef.current) out.push(await captureNode(previewRef.current, CAP_W, CAP_H));
        }
        return out;
    }

    return (
        <>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3 }}>
                <Typography
                    sx={{ p: 2, display: "flex", alignItems: "center", color: "blue", "&:hover": { textDecoration: "underline", cursor: "pointer" } }}
                    onClick={() => navigate(-1)}
                >
                    <ArrowBackIos fontSize="small" /> exit
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                    {/* <LandingButton title="Add to basket" variant="outlined" /> */}
                    <LandingButton
                        title="Download"
                        loading={downloading}
                        onClick={async () => {
                            try {
                                setDownloading(true);
                                const urls = await captureAllPreviews();
                                const slidesObj = Object.fromEntries(urls.map((u, i) => [`slide${i + 1}`, u]));
                                sessionStorage.setItem("slides", JSON.stringify(slidesObj));
                                navigate(USER_ROUTES.SUBSCRIPTION);
                            } finally {
                                setDownloading(false);
                            }
                        }}
                    />
                </Box>
            </Box>

            {/* Body */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                {/* PREVIEW BOX (same cover behavior as editor) */}
                <Box
                    // ref={previewRef}
                    sx={{
                        width: boxW,
                        height: boxH,
                        // position: "relative",
                        overflow: "hidden",
                        borderRadius: 2,
                        border: "1px solid rgba(0,0,0,0.12)",
                        // boxShadow: 3,
                        perspective: "1400px",
                    }}
                >
                    {/* Flip container */}
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            transformStyle: "preserve-3d",
                            transition: "transform 260ms ease",
                            transform:
                                !flipping
                                    ? "rotateY(0deg)"
                                    : flipDir === "next"
                                        ? "rotateY(-180deg)"
                                        : "rotateY(180deg)",
                        }}
                    >
                        {/* FRONT */}
                        <SlideView slide={slides[active]} captureRef={previewRef} />

                    </Box>
                </Box>

                {/* Pager */}
                {slideCount >= 2 && (
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <IconButton
                            onClick={goPrev}
                            disabled={active === 0 || flipping}
                            sx={{ border: `1px solid ${active === 0 ? "gray" : "#8D6DA1"}`, p: 1 }}
                            aria-label="Previous"
                        >
                            <KeyboardArrowLeft fontSize="large" />
                        </IconButton>
                        <IconButton
                            onClick={goNext}
                            disabled={active === slideCount - 1 || flipping}
                            sx={{ border: `1px solid ${active === slideCount - 1 ? "gray" : "#8D6DA1"}`, p: 1 }}
                            aria-label="Next"
                        >
                            <KeyboardArrowRight fontSize="large" />
                        </IconButton>
                    </Box>
                )}
            </Box >
        </>
    );
};

export default CategoriesWisePreview;

import React, { useMemo, useRef, useState, useEffect } from "react";
import { Box, Chip, IconButton, Stack, Typography, useMediaQuery } from "@mui/material";
import { ArrowBackIos, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import LandingButton from "../../../components/LandingButton/LandingButton";
import { toPng } from "html-to-image";
import { USER_ROUTES } from "../../../constant/route";

/* ---------- Types ---------- */
type BaseEl = { id: string; x: number; y: number; width: number; height: number };
type TextEl = BaseEl & { type: "text"; text: string; bold: boolean; italic: boolean; color: string; fontSize: number; fontFamily: string };
type ImageEl = BaseEl & { type: "image"; src: string };
type StickerEl = BaseEl & { type: "sticker"; src: string };
type AnyEl = TextEl | ImageEl | StickerEl;
type Slide = { id: number; label: string; elements: AnyEl[] };
type ArtboardConfig = { mmWidth: number; mmHeight: number; slideLabels?: string[]; maxWidth?: number; maxHeight?: number };

/* ---------- Helpers ---------- */
const mmToPx = (mm: number) => (mm / 25.4) * 96;
function fitCanvas(mmW: number, mmH: number, maxW: number, maxH: number) {
    const pxW = mmToPx(mmW), pxH = mmToPx(mmH);
    const scale = Math.min(maxW / pxW, maxH / pxH);
    return { width: Math.round(pxW * scale), height: Math.round(pxH * scale), scale };
}

// Transparent fallback
const TRANSPARENT_PX =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

// blob -> data URL
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

/** Upgrade any image/sticker src in slides from blob: -> data: before capture */
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

/* ---------- Slide DOM ---------- */
const SlideView: React.FC<{ slide: Slide }> = ({ slide }) => (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        {slide.elements.map((el) => {
            const style = { position: "absolute" as const, left: el.x, top: el.y, width: el.width, height: el.height };

            if (el.type === "image") {
                const img = el as ImageEl;
                return (
                    <Box key={el.id} sx={style}>
                        <img
                            src={img.src}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4, display: "block" }}
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
            return (
                <Box key={el.id} sx={style}>
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            fontWeight: t.bold ? 700 : 400,
                            fontStyle: t.italic ? "italic" : "normal",
                            fontSize: `${t.fontSize}px`,
                            fontFamily: t.fontFamily || "inherit",
                            color: t.color,
                            lineHeight: `${t.fontSize}px`,
                            whiteSpace: "pre-wrap",
                            overflow: "hidden",
                            userSelect: "none",
                            textAlign: "center",
                        }}
                    >
                        {t.text}
                    </Box>
                </Box>
            );
        })}
    </Box>
);

/* ---------- Category-aware shell ---------- */
const PreviewFrame: React.FC<{ category: string; displayW: number; displayH: number; slide: Slide }> = ({
    category,
    displayW,
    displayH,
    slide,
}) => {
    const insetW = Math.round(displayW * 0.4);
    const insetH = Math.round(displayH * 0.43);

    if (category === "Stationery (Notebook Covers)") {
        return (
            <Box sx={{ position: "relative", width: displayW, height: displayH, overflow: "hidden", borderRadius: 2, border: "1px solid #ccc", bgcolor: "#fff" }}>
                <Box component="img" src="/assets/images/notebook_cover.webp" alt="" sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <Box sx={{ position: "absolute", right: 6, bottom: 10, width: insetW, height: insetH, overflow: "hidden", borderRadius: 1, border: "1px solid #ccc", bgcolor: "#fff" }}>
                    <SlideView slide={slide} />
                </Box>
            </Box>
        );
    }

    if (category === "Wall Art" || category === "Photo Art") {
        return (
            <Box sx={{ position: "relative", width: displayW, height: displayH, overflow: "hidden", borderRadius: 2, bgcolor: "#fff", boxShadow: 3 }}>
                <SlideView slide={slide} />
            </Box>
        );
    }

    return (
        <Box sx={{ position: "relative", width: displayW, height: displayH, overflow: "hidden", borderRadius: 2, border: "1px solid #ccc", bgcolor: "#fff" }}>
            <SlideView slide={slide} />
        </Box>
    );
};

/* ---------- Component ---------- */
const CategoriesWisePreview: React.FC = () => {
    const { state } = useLocation() as { state?: { slides?: Slide[]; config?: ArtboardConfig; slideIndex?: number; category?: string } };

    const initialSlides = state?.slides ?? [];
    const config = state?.config;
    const start = state?.slideIndex ?? 0;
    const category = state?.category ?? "Category";

    const [slides, setSlides] = useState<Slide[]>(initialSlides);
    const [active, setActive] = useState(start);
    const isMobile = useMediaQuery("(max-width:480px)");
    const navigate = useNavigate();

    useEffect(() => {
        // upgrade any blob: src to data: once
        (async () => setSlides(await ensureDataUrls(initialSlides)))();
    }, [initialSlides]);

    if (!config || !slides.length) {
        return (
            <Box sx={{ height: "92vh", display: "grid", placeItems: "center" }}>
                <Typography>No preview data.</Typography>
            </Box>
        );
    }

    const DISPLAY_MAX_W = 500;
    const DISPLAY_MAX_H = 700;
    const fitted = useMemo(() => fitCanvas(config.mmWidth, config.mmHeight, DISPLAY_MAX_W, DISPLAY_MAX_H), [config.mmWidth, config.mmHeight]);
    const displayW = Math.round(fitted.width * (isMobile ? 0.8 : 1));
    const displayH = Math.round(fitted.height * (isMobile ? 0.8 : 1));

    const CAP_W = config.maxWidth ?? 500;
    const CAP_H = config.maxHeight ?? 700;

    const slideCount = slides.length;
    const goNext = () => setActive((i) => Math.min(i + 1, slideCount - 1));
    const goPrev = () => setActive((i) => Math.max(i - 1, 0));

    const previewRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);
    const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

    async function captureNode(node: HTMLElement, w: number, h: number) {
        try { await (document as any).fonts?.ready; } catch { }

        // 1) Deep-clone the node
        const clone = node.cloneNode(true) as HTMLElement;

        // 2) Clean the clone: remove external stylesheet links (e.g., Google Fonts)
        clone.querySelectorAll('link[rel="stylesheet"]').forEach((lnk) => {
            const href = lnk.getAttribute("href") || "";
            if (/^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)) {
                lnk.parentElement?.removeChild(lnk);
            }
        });

        // 3) Ensure <img> have crossorigin and explicit sizes
        clone.querySelectorAll("img").forEach((img) => {
            img.setAttribute("crossorigin", "anonymous");
            // Make sure layout is stable for capture
            (img as HTMLImageElement).decoding = "sync";
            (img as HTMLImageElement).loading = "eager";
        });

        // 4) Put the clone in an offscreen sandbox so styles/layout apply
        const sandbox = document.createElement("div");
        sandbox.style.position = "fixed";
        sandbox.style.left = "-10000px";
        sandbox.style.top = "-10000px";
        sandbox.style.width = `${w}px`;
        sandbox.style.height = `${h}px`;
        sandbox.style.pointerEvents = "none";
        sandbox.style.opacity = "1";
        sandbox.appendChild(clone);
        document.body.appendChild(sandbox);

        // 5) Make sure the clone has the exact dimensions we want to capture
        clone.style.width = `${w}px`;
        clone.style.height = `${h}px`;
        clone.style.transform = "none";
        clone.style.transformOrigin = "top left";

        try {
            const dataUrl = await toPng(clone, {
                cacheBust: true,
                backgroundColor: "#ffffff",
                pixelRatio: 2,
                width: w,
                height: h,
                imagePlaceholder: TRANSPARENT_PX,
                style: {
                    width: `${w}px`,
                    height: `${h}px`,
                    transform: "none",
                    transformOrigin: "top left",
                },
                // Filter still helps if any stray links remain
                filter: (n: Node) => {
                    if (n instanceof HTMLLinkElement) {
                        const href = n.getAttribute("href") || "";
                        if (/fonts\.googleapis\.com/i.test(href)) return false;
                    }
                    return true;
                },
            });
            return dataUrl;
        } finally {
            sandbox.remove();
        }
    }

    async function captureAllPreviews(): Promise<string[]> {
        const out: string[] = [];
        for (let i = 0; i < slideCount; i++) {
            setActive(i);
            await nextFrame();
            if (previewRef.current) {
                const dataUrl = await captureNode(previewRef.current, CAP_W, CAP_H);
                out.push(dataUrl);
            }
        }
        return out;
    }

    return (
        <>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3 }}>
                <Typography sx={{ p: 2, display: "flex", alignItems: "center", color: "blue", "&:hover": { textDecoration: "underline", cursor: "pointer" } }} onClick={() => navigate(-1)}>
                    <ArrowBackIos fontSize="small" /> exit
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <LandingButton title="Add to basket" variant="outlined" />
                    <LandingButton
                        title="Download"
                        loading={loading}
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const urls = await captureAllPreviews();
                                const slidesObj = Object.fromEntries(urls.map((u, i) => [`slide${i + 1}`, u]));
                                sessionStorage.setItem("slides", JSON.stringify(slidesObj));
                                navigate(USER_ROUTES.SUBSCRIPTION);
                            } finally {
                                setLoading(false);
                            }
                        }}
                    />
                </Box>
            </Box>

            {/* Body */}
            <Box sx={{ p: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Chip size="small" label={`${config.mmWidth} × ${config.mmHeight} mm`} />
                    <Chip size="small" label={`display: ${displayW} × ${displayH}px`} />
                    <Chip size="small" label={`capture: ${CAP_W} × ${CAP_H}px`} />
                </Stack>

                {/* PREVIEW — category-aware wrapper renders SlideView inside */}
                <Box ref={previewRef}>
                    <PreviewFrame category={category} displayW={displayW} displayH={displayH} slide={slides[active]} />
                </Box>

                {/* Pager */}
                {slideCount >= 2 && (
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                        <IconButton onClick={goPrev} disabled={active === 0} sx={{ border: `1px solid ${active === 0 ? "gray" : "#8D6DA1"}`, p: 1 }} aria-label="Previous">
                            <KeyboardArrowLeft fontSize="large" />
                        </IconButton>
                        <IconButton
                            onClick={goNext}
                            disabled={active === slideCount - 1}
                            sx={{ border: `1px solid ${active === slideCount - 1 ? "gray" : "#8D6DA1"}`, p: 1 }}
                            aria-label="Next"
                        >
                            <KeyboardArrowRight fontSize="large" />
                        </IconButton>
                    </Box>
                )}

                <Typography variant="caption" sx={{ mt: 0.5 }}>
                    {slides[active]?.label}
                </Typography>
            </Box>
        </>
    );
};

export default CategoriesWisePreview;

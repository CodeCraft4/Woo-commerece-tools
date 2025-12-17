import {
    Box, IconButton, Typography, TextField, Chip, Stack, CircularProgress, Tooltip, Button
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { Collections, ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { USER_ROUTES } from "../../../constant/route";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchTempletDesignById } from "../../../source/source";
// NEW: html-to-image
import * as htmlToImage from "html-to-image";
import { COLORS } from "../../../constant/color";

/* --------- Types --------- */
type BaseEl = { id: string; x: number; y: number; width: number; height: number; slideId?: number };
type TextEl = BaseEl & { type: "text"; text: string; bold: boolean; italic: boolean; color: string; fontSize: number; fontFamily: string; };
type ImageEl = BaseEl & { type: "image"; src: string };
type StickerEl = BaseEl & { type: "sticker"; src: string };
type AnyEl = TextEl | ImageEl | StickerEl;

type Slide = { id: number; label: string; elements: AnyEl[] };
type AdminPreview = {
    category: string;
    config: { mmWidth: number; mmHeight: number; slideLabels: string[] };
    slides: Slide[];
};

/* --------- Utils --------- */
const mmToPx = (mm: number) => (mm / 25.4) * 96;
function fitCanvas(mmW: number, mmH: number, maxW = 520, maxH = 720) {
    const pxW = mmToPx(mmW), pxH = mmToPx(mmH);
    const scale = Math.min(maxW / pxW, maxH / pxH);
    return { width: pxW * scale, height: pxH * scale, scale, pxW, pxH };
}
const cloneSlides = (slides: Slide[]): Slide[] => JSON.parse(JSON.stringify(slides));
const asNum = (v: any, d = 0) => (typeof v === "number" && !Number.isNaN(v) ? v : d);
const asStr = (v: any, d = "") => (typeof v === "string" ? v : d);
const asBool = (v: any, d = false) => (typeof v === "boolean" ? v : d);
const A = <T,>(v: any): T[] => (Array.isArray(v) ? v : []);
const uuid = () => (globalThis.crypto?.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`);

const sanitizeSrc = (src?: string) => {
    if (!src) return "";
    if (!src.startsWith("blob:")) return src;
    try { const u = new URL(src); if (u.origin === window.location.origin) return src; } catch { }
    return "";
};
const normalize01 = (o: any, pxW: number, pxH: number) => {
    let x = asNum(o?.x, 0), y = asNum(o?.y, 0), w = asNum(o?.width ?? o?.w, 0), h = asNum(o?.height ?? o?.h, 0);
    const r = (n: number) => n > 0 && n <= 1;
    if (r(x) || r(y) || r(w) || r(h)) { x *= pxW; y *= pxH; w *= pxW; h *= pxH; }
    return { x, y, width: w, height: h };
};

/* --------- NEW helpers for capture --------- */
// Why: ensure images & fonts are ready before capture for correct rendering
async function waitForAssets(root: HTMLElement) {
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(
        imgs.map(img => {
            if (img.complete && img.naturalWidth > 0) return Promise.resolve();
            return new Promise<void>(res => {
                img.onload = () => res();
                img.onerror = () => res(); // ignore broken; avoids blocking
            });
        })
    );
    if ((document as any).fonts?.ready) {
        try { await (document as any).fonts.ready; } catch { /* ignore */ }
    }
}
// Why: filter out editor-only overlays from the exported artboard
const captureFilter = (node: unknown) => {
    if (!(node instanceof Element)) return true;
    if (node.classList?.contains("capture-exclude")) return false;

    // Hide file inputs/control overlays
    if (node.tagName?.toUpperCase() === "INPUT") {
        const t = (node as HTMLInputElement).type?.toLowerCase?.();
        if (t === "file" || t === "hidden") return false;
    }
    return true;
};

// 2) Utility: detect if artboard contains any blob images
function hasBlobImages(root: HTMLElement) {
    return !!root.querySelector('img[src^="blob:"]');
}
/* ------------ MAIN ------------ */
const TempletEditor = () => {
    const [loading, setLoading] = useState(true);
    const [adminDesign, setAdminDesign] = useState<AdminPreview | null>(null);
    const [userSlides, setUserSlides] = useState<Slide[]>([]);
    const [activeSlide, setActiveSlide] = useState(0);

    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // NEW: keep a ref for each slide container
    const slideRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const setSlideRef = (i: number) => (el: HTMLDivElement | null) => { slideRefs.current[i] = el; };

    const { productId } = useParams<{ productId: string }>();
    const { state } = useLocation() as { state?: { templetDesing?: any } };

    function buildSlidesFromRawStores(raw: any): { design: AdminPreview; slides: Slide[] } {
        const src = raw?.raw_stores ?? raw;
        const category = asStr(src?.category ?? src?.cardCategory ?? "Card");
        const mmWidth = asNum(src?.config?.mmWidth, 210);
        const mmHeight = asNum(src?.config?.mmHeight, 297);
        const labels: string[] = Array.isArray(src?.config?.slideLabels) ? src.config.slideLabels : [];
        const { pxW, pxH } = fitCanvas(mmWidth, mmHeight);

        const slidesDef: any[] = A(src?.slides);
        const imgEls = A<any>(src?.imageElements);
        const txtEls = A<any>(src?.textElements);
        const stkEls = A<any>(src?.stickerElements);

        const coerceText = (e: any): TextEl => {
            const r = normalize01(e, pxW, pxH);
            return {
                type: "text",
                id: asStr(e?.id) || uuid(),
                slideId: asNum(e?.slideId ?? e?.slide_id, 0),
                ...r,
                text: asStr(e?.text ?? e?.value),
                bold: asBool(e?.bold, false),
                italic: asBool(e?.italic, false),
                color: asStr(e?.color ?? "#000"),
                fontSize: asNum(e?.fontSize ?? e?.font_size, 16),
                fontFamily: asStr(e?.fontFamily ?? e?.font_family ?? "inherit"),
            };
        };
        const coerceImage = (e: any): ImageEl => {
            const r = normalize01(e, pxW, pxH);
            return {
                type: "image",
                id: asStr(e?.id) || uuid(),
                slideId: asNum(e?.slideId ?? e?.slide_id, 0),
                ...r,
                src: sanitizeSrc(asStr(e?.src ?? e?.url ?? e?.imageUrl ?? e?.image)),
            };
        };
        const coerceSticker = (e: any): StickerEl => {
            const r = normalize01(e, pxW, pxH);
            return {
                type: "sticker",
                id: asStr(e?.id) || uuid(),
                slideId: asNum(e?.slideId ?? e?.slide_id, 0),
                ...r,
                src: sanitizeSrc(asStr(e?.src ?? e?.url)),
            };
        };

        const slides: Slide[] = slidesDef.map((sl, i) => {
            const sid = asNum(sl?.id ?? i, i);
            const label = labels[i] ?? asStr(sl?.label, `Slide ${i + 1}`);
            const images = imgEls.filter((e) => (e?.slideId ?? e?.slide_id) === sid).map(coerceImage);
            const texts = txtEls.filter((e) => (e?.slideId ?? e?.slide_id) === sid).map(coerceText);
            const stickers = stkEls.filter((e) => (e?.slideId ?? e?.slide_id) === sid).map(coerceSticker);
            return { id: sid, label, elements: [...images, ...texts, ...stickers] };
        });

        return {
            design: { category, config: { mmWidth, mmHeight, slideLabels: labels }, slides },
            slides,
        };
    }

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (state?.templetDesing) {
                    const { design, slides } = buildSlidesFromRawStores(state.templetDesing);
                    setAdminDesign(design);
                    setUserSlides(slides);
                    setActiveSlide(0);
                    return;
                }
                if (productId) {
                    const row: any = await fetchTempletDesignById(productId);
                    const raw = row?.raw_stores ?? row;
                    const { design, slides } = buildSlidesFromRawStores(raw);
                    setAdminDesign(design);
                    setUserSlides(slides);
                    setActiveSlide(0);
                    return;
                }
                setAdminDesign(null);
                setUserSlides([]);
            } catch (e) {
                console.error("Failed to load template:", e);
                setAdminDesign(null);
                setUserSlides([]);
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId, state?.templetDesing]);

    const canvasSize = useMemo(() => {
        if (!adminDesign) return { width: 500, height: 700, scale: 1 };
        return fitCanvas(adminDesign.config.mmWidth, adminDesign.config.mmHeight);
    }, [adminDesign]);

    const scrollToSlide = (index: number) => {
        setActiveSlide(index);
        if (scrollRef.current) {
            const slideW = (scrollRef.current.children[0] as HTMLElement | undefined)?.clientWidth ?? 0;
            scrollRef.current.scrollTo({ left: slideW * index, behavior: "smooth" });
        }
    };

    // Text edit
    const onTextChange = (slideIndex: number, elId: string, text: string) => {
        setUserSlides(prev => {
            const copy = cloneSlides(prev);
            const el = copy[slideIndex].elements.find(e => e.id === elId);
            if (el && el.type === "text") (el as TextEl).text = text;
            return copy;
        });
    };

    // Image replace
    const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
    const setImageInputRef = (id: string) => (el: HTMLInputElement | null) => { fileInputsRef.current[id] = el; };
    const revokeIfBlob = (url?: string) => { if (url?.startsWith("blob:")) { try { URL.revokeObjectURL(url); } catch { } } };

    const onImagePicked = (slideIndex: number, elId: string, file: File | null) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setUserSlides(prev => {
            const copy = cloneSlides(prev);
            const el = copy[slideIndex].elements.find(e => e.id === elId);
            if (el && el.type === "image") {
                revokeIfBlob((el as ImageEl).src);
                (el as ImageEl).src = url;
            }
            return copy;
        });
    };

    useEffect(() => {
        return () => {
            userSlides.forEach(s => s.elements.forEach(el => { if (el.type === "image") revokeIfBlob((el as ImageEl).src); }));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const is3DCategory = (cat?: string) =>
        cat === "Mugs (11oz)" || cat === "Tote Bags" || cat === "Apparel (T-shirts & Hoodies)";
    // NEW: strict mug check
    const isMugCategory = (cat?: string) => cat === "Mugs (11oz)";

    // NEW: capture & navigate for mug
    const handleNavigatePrview = async () => {
        if (!adminDesign?.category) return;
        const category = encodeURIComponent(adminDesign.category);

        if (isMugCategory(adminDesign.category)) {
            const node = slideRefs.current[activeSlide];
            if (!node) {
                // Why: bail out gracefully if ref missing
                navigate(`${USER_ROUTES.TEMPLET_EDITORS_PREVIEW}/${category}/${productId ?? "state"}`, {
                    state: { slides: userSlides, config: adminDesign?.config, slideIndex: activeSlide, category: adminDesign.category },
                });
                return;
            }
            await waitForAssets(node);
            // Why: pixelRatio boosts sharpness on 3D wrap
            const dataUrl = await htmlToImage.toPng(node, {
                pixelRatio: 2,
                backgroundColor: COLORS.white,
                filter: captureFilter,
                cacheBust: hasBlobImages(node) ? false : true,
                skipFonts: false,
                // Optional: provide a placeholder for any failed images so capture still completes
                imagePlaceholder:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
            });

            navigate(`${USER_ROUTES.TEMPLET_EDITORS_PREVIEW}/${category}/${productId ?? "state"}`, {
                state: {
                    slides: userSlides,
                    config: adminDesign?.config,
                    slideIndex: activeSlide,
                    category: adminDesign.category,
                    mugImage: dataUrl
                },
            });
            return;
        }

        // non-mug route stays unchanged
        if (is3DCategory(adminDesign.category)) {
            navigate(`${USER_ROUTES.TEMPLET_EDITORS_PREVIEW}/${category}/${productId ?? "state"}`, {
                state: { slides: userSlides, config: adminDesign?.config, slideIndex: activeSlide, category: adminDesign.category },
            });
        } else {
            navigate(`${USER_ROUTES.CATEGORIES_EDITORS_PREVIEW}/${productId ?? "state"}`, {
                state: { slides: userSlides, config: adminDesign?.config, slideIndex: activeSlide, category: adminDesign.category },
            });
        }
    };

    if (loading)
        return (
            <Box sx={{ height: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );

    if (!adminDesign)
        return <Typography>No template found.</Typography>;

    return (
        <>
            {/* HEADER */}
            <Box px={8}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    <Chip label={`Category: ${adminDesign.category}`} size="small" />
                    <Chip label={`Slides: ${adminDesign.slides.length}`} size="small" />
                    <Chip label={`${adminDesign.config.mmWidth} × ${adminDesign.config.mmHeight} mm`} size="small" />
                    <Box flexGrow={1} />
                    <Button variant="contained" onClick={handleNavigatePrview}>Preview</Button>
                </Stack>
            </Box>

            {/* MAIN */}
            <Box sx={{ height: "90vh", display: "flex", flexDirection: "column", alignItems: "center", m: 'auto', justifyContent: 'center' }}>
                <Box
                    ref={scrollRef}
                    sx={{
                        display: "flex",
                        overflowX: "auto",
                        width: "100%",
                        px: 5,
                        py: 2,
                        justifyContent: "center",
                        gap: 9,
                        "&::-webkit-scrollbar": { display: "none" }
                    }}
                >
                    {userSlides.map((slide, i) => (
                        <Box key={slide.id} sx={{ position: "relative" }}>
                            <Box
                                ref={setSlideRef(i)}
                                sx={{
                                    width: canvasSize.width,
                                    height: canvasSize.height,
                                    boxShadow: 3,
                                    borderRadius: 3,
                                    position: "relative",
                                    bgcolor: "white",
                                }}
                            >
                                {slide.elements.map(el => {
                                    const style = { position: "absolute" as const, left: el.x, top: el.y, width: el.width, height: el.height };

                                    if (el.type === "image")
                                        return (
                                            <Box key={el.id} sx={style}>
                                                {/* Why: anonymous to reduce CORS taint if using remote URLs later */}
                                                <img crossOrigin="anonymous" src={(el as ImageEl).src} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} />
                                                <Tooltip title="Replace image">
                                                    {/* NEW: exclude from capture */}
                                                    <Box
                                                        className="capture-exclude"
                                                        onClick={() => fileInputsRef.current[el.id]?.click()}
                                                        sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { background: "rgba(0,0,0,0.25)" } }}
                                                    >
                                                        <IconButton sx={{ color: "white" }}>
                                                            <Collections />
                                                        </IconButton>
                                                    </Box>
                                                </Tooltip>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={setImageInputRef(el.id)}
                                                    onChange={e => onImagePicked(i, el.id, e.target.files?.[0] || null)}
                                                    style={{ display: "none" }}
                                                />
                                            </Box>
                                        );

                                    if (el.type === "text") {
                                        const t = el as TextEl;
                                        return (
                                            <Box key={el.id} sx={{ position: "absolute", left: el.x, top: el.y, width: el.width, height: el.height, p: 0.5 }}>
                                                <TextField
                                                    multiline
                                                    value={t.text}
                                                    onChange={(e) => onTextChange(i, el.id, e.target.value)}
                                                    variant="standard"
                                                    autoFocus
                                                    InputProps={{
                                                        disableUnderline: true, sx: {
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            display: 'flex',
                                                            m: 'auto',
                                                            height: "100%",
                                                            p: 1,
                                                            border: '1px solid lightGray',
                                                            borderRadius: 1,
                                                            "& .MuiInputBase-input": { p: 0, m: 0, border: 'none' },
                                                            "& .MuiInputBase-inputMultiline": { lineHeight: `${t.fontSize}px`, padding: 0, margin: 0, minHeight: "100%", },
                                                        },
                                                    }}
                                                    inputProps={{
                                                        style: {
                                                            fontWeight: t.bold ? 700 : 400,
                                                            fontStyle: t.italic ? "italic" : "normal",
                                                            fontSize: t.fontSize, fontFamily: t.fontFamily, color: t.color,
                                                        },
                                                    }}
                                                    sx={{ height: "100%", overflow: "hidden", width: "100%" }}
                                                />
                                                {/* <TextField
                                                    fullWidth
                                                    multiline
                                                    value={t.text}
                                                    onChange={(e) => onTextChange(i, el.id, e.target.value)}
                                                    variant="standard"
                                                    InputProps={{
                                                        disableUnderline: true,
                                                        sx: {
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            display: 'flex',
                                                            m: 'auto',
                                                            height: "100%",
                                                            p: 0.5,
                                                            border: '1px solid gray',
                                                            borderRadius: 1,
                                                            "& .MuiInputBase-input": { p: 0, m: 0, border: 'none' },
                                                            "& .MuiInputBase-inputMultiline": { lineHeight: `${t.fontSize}px`, padding: 0, margin: 0, minHeight: "100%" },
                                                        },
                                                    }}
                                                    sx={{ height: "100%", overflow: "hidden" }}
                                                    inputProps={{
                                                        style: {
                                                            fontWeight: t.bold ? 700 : 400,
                                                            fontStyle: t.italic ? "italic" : "normal",
                                                            fontSize: t.fontSize, fontFamily: t.fontFamily, color: t.color,
                                                        },
                                                    }}
                                                /> */}
                                            </Box>
                                        );
                                    }

                                    if (el.type === "sticker")
                                        return <Box key={el.id} component={"img"} src={(el as StickerEl).src} sx={{ ...style, objectFit: "contain" }} />;

                                    return null;
                                })}
                            </Box>
                        </Box>
                    ))}
                </Box>

                {/* Thumbnails */}
                <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "center" }}>
                    <IconButton onClick={() => scrollToSlide(Math.max(0, activeSlide - 1))}><ArrowBackIos /></IconButton>
                    {userSlides.map((slide, i) => (
                        <Box
                            key={slide.id}
                            onClick={() => scrollToSlide(i)}
                            sx={{ px: 1.5, py: 1, borderRadius: 2, cursor: "pointer", bgcolor: activeSlide === i ? "#1976d2" : "#eceff1", color: activeSlide === i ? "white" : "#000" }}
                        >
                            {slide.label}
                        </Box>
                    ))}
                    <IconButton onClick={() => scrollToSlide(Math.min(activeSlide + 1, userSlides.length - 1))}><ArrowForwardIos /></IconButton>
                </Box>
            </Box>
        </>
    );
};

export default TempletEditor;

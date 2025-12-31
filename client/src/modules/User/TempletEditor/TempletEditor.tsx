// src/pages/TempletEditor.tsx
import {
    Box,
    IconButton,
    Typography,
    TextField,
    Chip,
    Stack,
    CircularProgress,
    Tooltip,
    Button,
    Divider,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Collections,
    ArrowBackIos,
    ArrowForwardIos,
    TextFields,
    Image as ImageIcon,
    Close,
} from "@mui/icons-material";
import { USER_ROUTES } from "../../../constant/route";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { fetchTempletDesignById } from "../../../source/source";
import * as htmlToImage from "html-to-image";
import { COLORS } from "../../../constant/color";
import { coverScale, mmToPx } from "../../../lib/lib";

/* --------- Types --------- */
type BaseEl = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    slideId?: number;
    zIndex?: number;
    editable?: boolean;
};

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

type CanvasPx = { w: number; h: number; dpi?: number };
type AdminPreview = {
    category: string;
    config: { mmWidth: number; mmHeight: number; slideLabels: string[] };
    canvasPx: CanvasPx;
    slides: Slide[];
};

/* --------- Utils --------- */
const mmToPxAtDpi = (mm: number, dpi: number) => (mm / 25.4) * dpi;

function fallbackCanvasPx(mmW: number, mmH: number, dpi = 96): CanvasPx {
    return {
        w: Math.round(mmToPxAtDpi(mmW, dpi)),
        h: Math.round(mmToPxAtDpi(mmH, dpi)),
        dpi,
    };
}

const cloneSlides = (slides: Slide[]): Slide[] => JSON.parse(JSON.stringify(slides));
const asNum = (v: any, d = 0) => (typeof v === "number" && !Number.isNaN(v) ? v : d);
const asStr = (v: any, d = "") => (typeof v === "string" ? v : d);
const asBool = (v: any, d = false) => (typeof v === "boolean" ? v : d);
const A = <T,>(v: any): T[] => (Array.isArray(v) ? v : []);
const uuid = () => globalThis.crypto?.randomUUID?.() ?? `id_${Math.random().toString(36).slice(2)}`;

const sanitizeSrc = (src?: string) => {
    if (!src) return "";
    if (src.startsWith("data:") || src.startsWith("http")) return src;
    if (!src.startsWith("blob:")) return src;
    try {
        const u = new URL(src);
        if (u.origin === window.location.origin) return src;
    } catch { }
    return "";
};

const normalize01 = (o: any, pxW: number, pxH: number) => {
    let x = asNum(o?.x, 0),
        y = asNum(o?.y, 0),
        w = asNum(o?.width ?? o?.w, 0),
        h = asNum(o?.height ?? o?.h, 0);

    const r = (n: number) => n > 0 && n <= 1;
    if (r(x) || r(y) || r(w) || r(h)) {
        x *= pxW;
        y *= pxH;
        w *= pxW;
        h *= pxH;
    }
    return { x, y, width: w, height: h };
};

async function waitForAssets(root: HTMLElement) {
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(
        imgs.map((img) => {
            const i = img as HTMLImageElement;
            if (i.complete && i.naturalWidth > 0) return Promise.resolve();
            return new Promise<void>((res) => {
                i.onload = () => res();
                i.onerror = () => res();
            });
        })
    );
    if ((document as any).fonts?.ready) {
        try {
            await (document as any).fonts.ready;
        } catch { }
    }
}

const captureFilter = (node: unknown) => {
    if (!(node instanceof Element)) return true;
    if (node.classList?.contains("capture-exclude")) return false;
    if (node.tagName?.toUpperCase() === "INPUT") {
        const t = (node as HTMLInputElement).type?.toLowerCase?.();
        if (t === "file" || t === "hidden") return false;
    }
    return true;
};

function hasBlobImages(root: HTMLElement) {
    return !!root.querySelector('img[src^="blob:"]');
}

/* --------- Persist helpers --------- */
const storageKey = (productId?: string) => `templet_editor_state:${productId ?? "state"}`;

function safeJsonParse<T>(s: string | null): T | null {
    if (!s) return null;
    try {
        return JSON.parse(s) as T;
    } catch {
        return null;
    }
}

const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result || ""));
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });

/* ------------ MAIN ------------ */
export default function TempletEditor() {
    const [loading, setLoading] = useState(true);
    const [adminDesign, setAdminDesign] = useState<AdminPreview | null>(null);
    const [userSlides, setUserSlides] = useState<Slide[]>([]);
    const [activeSlide, setActiveSlide] = useState(0);
    const [selectedElId, setSelectedElId] = useState<string | null>(null);

    const selectedEl = useMemo(() => {
        const s = userSlides[activeSlide];
        if (!s || !selectedElId) return null;
        return s.elements.find((e) => e.id === selectedElId) ?? null;
    }, [userSlides, activeSlide, selectedElId]);

    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const slideRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const setSlideRef = (i: number) => (el: HTMLDivElement | null) => {
        slideRefs.current[i] = el;
    };

    const { productId } = useParams<{ productId: string }>();
    const { state } = useLocation() as { state?: { templetDesign?: any } };

    const didRestoreRef = useRef(false);

    function buildSlidesFromRawStores(raw: any): { design: AdminPreview; slides: Slide[] } {
        const src = raw?.raw_stores ?? raw;

        const category = asStr(src?.category ?? src?.editorCategory ?? src?.cardCategory ?? "Card");
        const mmWidth = asNum(src?.config?.mmWidth, asNum(src?.canvas?.mm?.w, 210));
        const mmHeight = asNum(src?.config?.mmHeight, asNum(src?.canvas?.mm?.h, 297));
        const labels: string[] = Array.isArray(src?.config?.slideLabels) ? src.config.slideLabels : [];

        const canvasPx: CanvasPx =
            src?.canvas?.px?.w && src?.canvas?.px?.h
                ? { w: asNum(src.canvas.px.w, 0), h: asNum(src.canvas.px.h, 0), dpi: asNum(src.canvas.px.dpi, 96) }
                : fallbackCanvasPx(mmWidth, mmHeight, 96);

        const pxW = canvasPx.w;
        const pxH = canvasPx.h;

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
                align: (asStr(e?.align, "center") as any) ?? "center",
                zIndex: asNum(e?.zIndex ?? e?.z_index, 1),
                editable: e?.editable !== false,
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
                zIndex: asNum(e?.zIndex ?? e?.z_index, 1),
                editable: e?.editable !== false,
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
                zIndex: asNum(e?.zIndex ?? e?.z_index, 1),
                editable: e?.editable !== false,
            };
        };

        const slides: Slide[] = slidesDef.map((sl, i) => {
            const sid = asNum(sl?.id ?? i, i);
            const label = labels[i] ?? asStr(sl?.label, `Slide ${i + 1}`);

            const images = imgEls.filter((e) => (e?.slideId ?? e?.slide_id) === sid).map(coerceImage);
            const texts = txtEls.filter((e) => (e?.slideId ?? e?.slide_id) === sid).map(coerceText);
            const stickers = stkEls.filter((e) => (e?.slideId ?? e?.slide_id) === sid).map(coerceSticker);

            const elements: AnyEl[] = [...images, ...texts, ...stickers].sort(
                (a, b) => asNum(a.zIndex, 1) - asNum(b.zIndex, 1)
            );

            return { id: sid, label, elements };
        });

        return {
            design: { category, config: { mmWidth, mmHeight, slideLabels: labels }, canvasPx, slides },
            slides,
        };
    }

    // ✅ Restore from sessionStorage
    useEffect(() => {
        const restored = safeJsonParse<{
            adminDesign: AdminPreview;
            userSlides: Slide[];
            activeSlide: number;
            selectedElId: string | null;
        }>(sessionStorage.getItem(storageKey(productId)));

        if (restored?.adminDesign && restored?.userSlides?.length) {
            didRestoreRef.current = true;
            setAdminDesign(restored.adminDesign);
            setUserSlides(restored.userSlides);
            setActiveSlide(restored.activeSlide ?? 0);
            setSelectedElId(restored.selectedElId ?? null);
            setLoading(false);
        }
    }, [productId]);

    // ✅ Load only if not restored
    useEffect(() => {
        if (didRestoreRef.current) return;

        const load = async () => {
            setLoading(true);
            try {
                if (state?.templetDesign) {
                    const { design, slides } = buildSlidesFromRawStores(state.templetDesign);
                    setAdminDesign(design);
                    setUserSlides(slides);
                    setActiveSlide(0);
                    setSelectedElId(null);
                    return;
                }

                if (productId) {
                    const row: any = await fetchTempletDesignById(productId);
                    const raw = row?.raw_stores ?? row;
                    const { design, slides } = buildSlidesFromRawStores(raw);
                    setAdminDesign(design);
                    setUserSlides(slides);
                    setActiveSlide(0);
                    setSelectedElId(null);
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
    }, [productId, state?.templetDesign]);

    // ✅ Persist on every change
    // useEffect(() => {
    //     // if (!adminDesign) return;
    //     sessionStorage?.setItem(
    //         storageKey(productId),
    //         JSON.stringify({ adminDesign, userSlides, activeSlide, selectedElId })
    //     );
    // }, [adminDesign, userSlides, activeSlide, selectedElId, productId]);

    const scrollToSlide = (index: number) => {
        setActiveSlide(index);
        setSelectedElId(null);
        if (scrollRef.current) {
            const slideW = (scrollRef.current.children[0] as HTMLElement | undefined)?.clientWidth ?? 0;
            scrollRef.current.scrollTo({ left: slideW * index, behavior: "smooth" });
        }
    };

    const onTextChange = (slideIndex: number, elId: string, text: string) => {
        setUserSlides((prev) => {
            const copy = cloneSlides(prev);
            const el = copy[slideIndex]?.elements.find((e) => e.id === elId);
            if (el && el.type === "text" && (el as TextEl).editable !== false) (el as TextEl).text = text;
            return copy;
        });
    };

    const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
    const setImageInputRef = (id: string) => (el: HTMLInputElement | null) => {
        fileInputsRef.current[id] = el;
    };

    const onImagePicked = async (slideIndex: number, elId: string, file: File | null) => {
        if (!file) return;
        const dataUrl = await fileToDataUrl(file);

        setUserSlides((prev) => {
            const copy = cloneSlides(prev);
            const el = copy[slideIndex]?.elements.find((e) => e.id === elId);
            if (el && el.type === "image" && (el as ImageEl).editable !== false) {
                (el as ImageEl).src = dataUrl;
            }
            return copy;
        });
    };

    const is3DCategory = (cat?: string) => cat === "Mugs" || cat === "Tote Bags" || cat === "Apparel";
    const isMugCategory = (cat?: string) => cat === "Mugs";

    const handleNavigatePrview = async () => {
        if (!adminDesign?.category) return;
        const category = encodeURIComponent(adminDesign.category);

        const navStateBase = {
            slides: userSlides,
            config: adminDesign.config,
            canvasPx: adminDesign.canvasPx,
            slideIndex: activeSlide,
            category: adminDesign.category,
        };

        if (isMugCategory(adminDesign.category)) {
            const node = slideRefs.current[activeSlide];
            if (!node) {
                navigate(`${USER_ROUTES.TEMPLET_EDITORS_PREVIEW}/${category}/${productId ?? "state"}`, {
                    state: navStateBase,
                });
                return;
            }

            await waitForAssets(node);
            const dataUrl = await htmlToImage.toPng(node, {
                pixelRatio: 2,
                backgroundColor: COLORS.white,
                filter: captureFilter,
                cacheBust: hasBlobImages(node) ? false : true,
                skipFonts: false,
                imagePlaceholder:
                    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=",
            });

            navigate(`${USER_ROUTES.TEMPLET_EDITORS_PREVIEW}/${category}/${productId ?? "state"}`, {
                state: { ...navStateBase, mugImage: dataUrl },
            });
            return;
        }

        if (is3DCategory(adminDesign.category)) {
            navigate(`${USER_ROUTES.TEMPLET_EDITORS_PREVIEW}/${category}/${productId ?? "state"}`, { state: navStateBase });
        } else {
            navigate(`${USER_ROUTES.CATEGORIES_EDITORS_PREVIEW}/${productId ?? "state"}`, { state: navStateBase });
        }
    };

    const canEditSelected = !!selectedEl && selectedEl.editable !== false;
    const isSelectedText = selectedEl?.type === "text";
    const isSelectedImage = selectedEl?.type === "image";

    const openSelectedImagePicker = () => {
        if (!selectedEl || selectedEl.type !== "image") return;
        if (selectedEl.editable === false) return;
        fileInputsRef.current[selectedEl.id]?.click();
    };

    if (loading)
        return (
            <Box sx={{ height: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );

    if (!adminDesign) return <Typography>No template found.</Typography>;

    // const canvasW = adminDesign.canvasPx.w;
    // const canvasH = adminDesign.canvasPx.h;

    return (
        <>
            {/* HEADER */}
            <Box px={8}>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    {/* <Chip label={`Category: ${adminDesign.category}`} size="small" /> */}
                    <Chip label={`Slides: ${userSlides.length}`} size="small" />
                    <Chip label={`${adminDesign.config.mmWidth} × ${adminDesign.config.mmHeight} mm`} size="small" />
                    {/* <Chip label={`Canvas: ${canvasW} × ${canvasH} px`} size="small" /> */}
                    <Box flexGrow={1} />
                    <Button variant="contained" onClick={handleNavigatePrview}>
                        Preview
                    </Button>
                </Stack>
            </Box>

            {/* MAIN */}
            <Box
                sx={{
                    height: "90vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Box
                    ref={scrollRef}
                    sx={{
                        display: "flex",
                        overflowX: "auto",
                        width: "100%",
                        px: 5,
                        py: 2,
                        justifyContent: "center",
                        gap: 5,
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    {userSlides.map((slide, i) => {
                        const ordered = [...slide.elements].sort((a, b) => asNum(a.zIndex, 1) - asNum(b.zIndex, 1));

                        // base canvas size from DB (fitCanvas)
                        const boxW = 480;
                        const boxH = 450;
                        const row = state?.templetDesign ?? {};
                        const baseW =
                            row?.config?.fitCanvas?.width ??
                            row?.raw_stores?.config?.fitCanvas?.width ??
                            row?.raw_stores?.canvas?.px?.w ??
                            Math.round(mmToPx(row?.config?.mmWidth ?? 210));

                        const baseH =
                            row?.config?.fitCanvas?.height ??
                            row?.raw_stores?.config?.fitCanvas?.height ??
                            row?.raw_stores?.canvas?.px?.h ??
                            Math.round(mmToPx(row?.config?.mmHeight ?? 297));

                        // ✅ cover like TempletForm
                        const { scale, w, h } = coverScale(baseW, baseH, boxW, boxH);


                        return (
                            <Box key={slide.id} sx={{
                                position: "relative", display: "flex", gap: 2, flex: "0 0 auto",
                                ml: i === 0 ? 350 : 0,
                            }}>
                                {/* TOOLBAR */}
                                {i === activeSlide && (
                                    <Box
                                        className="capture-exclude"
                                        sx={{
                                            position: "sticky",
                                            top: 0,
                                            alignSelf: "flex-start",
                                            height: 'auto', // ✅ use displayH
                                            width: 64,
                                            borderRadius: 2,
                                            bgcolor: "#fff",
                                            boxShadow: 3,
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 1,
                                            py: 1,
                                            flex: "0 0 auto",
                                        }}
                                    >
                                        <Typography variant="caption">Tools</Typography>
                                        <Divider flexItem sx={{ width: "80%" }} />

                                        <Tooltip title={selectedElId ? "Clear selection" : "No selection"}>
                                            <span>
                                                <IconButton
                                                    disabled={!selectedElId}
                                                    onClick={() => setSelectedElId(null)}
                                                    size="small"
                                                    sx={{ border: "1px solid rgba(0,0,0,0.12)" }}
                                                >
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Divider flexItem sx={{ width: "80%" }} />

                                        <Tooltip title={canEditSelected && isSelectedText ? "Edit selected text" : "Select an editable text"}>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={!(canEditSelected && isSelectedText)}
                                                    sx={{ border: "1px solid rgba(0,0,0,0.12)" }}
                                                >
                                                    <TextFields fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Tooltip title={canEditSelected && isSelectedImage ? "Upload selected image" : "Select an editable image"}>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    disabled={!(canEditSelected && isSelectedImage)}
                                                    onClick={openSelectedImagePicker}
                                                    sx={{ border: "1px solid rgba(0,0,0,0.12)" }}
                                                >
                                                    <ImageIcon fontSize="small" />
                                                </IconButton>
                                            </span>
                                        </Tooltip>

                                        <Divider flexItem sx={{ width: "80%" }} />
                                        <Typography variant="caption" sx={{ color: "#666" }}>
                                            {selectedElId ? (canEditSelected ? "Editable" : "Locked") : "Select"}
                                        </Typography>
                                    </Box>
                                )}

                                <Box
                                    ref={setSlideRef(i)}
                                    sx={{
                                        width: w * scale + 0,
                                        height: h * scale,
                                        left: 0,
                                        top: 0,
                                        borderRadius: 3,
                                        position: "relative",
                                        overflow: "hidden",
                                        bgcolor: "rgba(255, 255, 255, 1)",
                                        boxShadow: 2,
                                        // border: '1px solid red',
                                        flex: "0 0 auto",
                                    }}
                                    onClick={() => setSelectedElId(null)}
                                >
                                    {/* ✅ "CARD" layer (scaled + centered) */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            transform: "none",
                                            transformOrigin: "top left",
                                        }}
                                    >
                                        {ordered.map((el) => {
                                            const isLocked = el.editable === false;
                                            const isSelected = selectedElId === el.id && i === activeSlide;

                                            const cursor = isSelected
                                                ? "text"
                                                : isLocked
                                                    ? "not-allowed"
                                                    : 'text';

                                            // ✅ scaled element coordinates
                                            const baseStyle = {
                                                position: "absolute" as const,
                                                left: el.x * scale,
                                                top: el.y * scale,
                                                width: el.width * scale,
                                                height: el.height * scale,
                                                zIndex: asNum(el.zIndex, 1),
                                                cursor,
                                                borderRadius: 1,
                                            };

                                            if (el.type === "image") {
                                                const img = el as ImageEl;
                                                return (
                                                    <Box
                                                        key={el.id}
                                                        sx={{ ...baseStyle, overflow: "hidden" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedElId(el.id);
                                                        }}
                                                    >
                                                        <img
                                                            crossOrigin="anonymous"
                                                            src={img.src}
                                                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                                        />

                                                        {el.editable !== false && (
                                                            <Box
                                                                className="capture-exclude"
                                                                sx={{
                                                                    position: "absolute",
                                                                    inset: 0,
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    opacity: 0,
                                                                    transition: "opacity .15s ease",
                                                                    "&:hover": { opacity: 1, background: "rgba(0,0,0,0.18)" },
                                                                    cursor: "pointer",
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedElId(el.id);
                                                                    fileInputsRef.current[el.id]?.click();
                                                                }}
                                                            >
                                                                <Collections sx={{ color: "#fff" }} />
                                                            </Box>
                                                        )}

                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            ref={setImageInputRef(el.id)}
                                                            onChange={(e) => onImagePicked(i, el.id, e.target.files?.[0] || null)}
                                                            style={{ display: "none" }}
                                                            disabled={el.editable === false}
                                                        />
                                                    </Box>
                                                );
                                            }

                                            if (el.type === "text") {
                                                const t = el as TextEl;
                                                const align = t.align ?? "center";

                                                return (
                                                    <Box
                                                        key={el.id}
                                                        sx={{ ...baseStyle, p: 0.5 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedElId(el.id);
                                                        }}
                                                    >
                                                        {t.editable !== false ? (
                                                            <TextField
                                                                multiline
                                                                value={t.text}
                                                                onChange={(e) => onTextChange(i, el.id, e.target.value)}
                                                                variant="standard"
                                                                InputProps={{
                                                                    disableUnderline: true,
                                                                    sx: {
                                                                        height: 'auto',
                                                                        p: 0.5,
                                                                        "& .MuiInputBase-inputMultiline": {
                                                                            padding: 0,
                                                                            margin: 0,
                                                                            minHeight: "100%",
                                                                            textAlign: align,

                                                                        },
                                                                    },
                                                                }}
                                                                inputProps={{
                                                                    style: {
                                                                        fontWeight: t.bold ? 700 : 400,
                                                                        fontStyle: t.italic ? "italic" : "normal",
                                                                        fontSize: t.fontSize * scale,
                                                                        fontFamily: t.fontFamily,
                                                                        color: t.color,
                                                                        lineHeight: 1,

                                                                    },
                                                                }}
                                                                sx={{ height: "100%", overflow: "hidden", width: "100%" }}
                                                            />
                                                        ) : (
                                                            <Typography
                                                                sx={{
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent:
                                                                        align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
                                                                    fontWeight: t.bold ? 700 : 400,
                                                                    fontStyle: t.italic ? "italic" : "normal",
                                                                    fontSize: t.fontSize * scale,
                                                                    fontFamily: t.fontFamily,
                                                                    color: t.color,
                                                                    textAlign: align as any,
                                                                    whiteSpace: "pre-wrap",
                                                                    overflow: "hidden",
                                                                    userSelect: "none",
                                                                }}
                                                            >
                                                                {t.text}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                );
                                            }

                                            if (el.type === "sticker") {
                                                const st = el as StickerEl;
                                                return (
                                                    <Box
                                                        key={el.id}
                                                        component="img"
                                                        src={st.src}
                                                        sx={{ ...baseStyle, objectFit: "contain" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedElId(el.id);
                                                        }}
                                                    />
                                                );
                                            }

                                            return null;
                                        })}
                                    </Box>
                                </Box>

                            </Box>
                        );
                    })}
                </Box>


                {/* Thumbnails */}
                <Box sx={{ display: "flex", gap: 1, mt: 2, alignItems: "center" }}>
                    <IconButton onClick={() => scrollToSlide(Math.max(0, activeSlide - 1))}>
                        <ArrowBackIos />
                    </IconButton>

                    {userSlides.map((slide, i) => (
                        <Box
                            key={slide.id}
                            onClick={() => scrollToSlide(i)}
                            sx={{
                                px: 1.5,
                                py: 1,
                                borderRadius: 2,
                                cursor: "pointer",
                                bgcolor: activeSlide === i ? "#1976d2" : "#eceff1",
                                color: activeSlide === i ? "white" : "#000",
                            }}
                        >
                            {slide.label}
                        </Box>
                    ))}

                    <IconButton onClick={() => scrollToSlide(Math.min(activeSlide + 1, userSlides.length - 1))}>
                        <ArrowForwardIos />
                    </IconButton>
                </Box>
            </Box>
        </>
    );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, IconButton, useMediaQuery } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "./card.css";
import GlobalWatermark from "../../../../../components/GlobalWatermark/GlobalWatermark";
import Slide1 from "../Slide1/Slide1";
import Slide2 from "../Slide2/Slide2";
import Slide3 from "../Slide3/Slide3";
import Slide4 from "../Slide4/Slide4";
import { useNavigate } from "react-router-dom";
import { USER_ROUTES } from "../../../../../constant/route";
import LandingButton from "../../../../../components/LandingButton/LandingButton";
import { clearSlidesFromIdb, saveSlidesToIdb } from "../../../../../lib/idbSlides";
import { resolveSlidesScopeCandidates, saveSlidesToScopes } from "../../../../../lib/slidesScope";
import { toJpeg } from "html-to-image";
import toast from "react-hot-toast";
import { isIosTouchDevice } from "../../../../../lib/platform";
import { useSlide1 } from "../../../../../context/Slide1Context";
import { useSlide2 } from "../../../../../context/Slide2Context";
import { useSlide3 } from "../../../../../context/Slide3Context";
import { useSlide4 } from "../../../../../context/Slide4Context";
import {
  collectTemplateSlideFonts,
  renderTemplateSlideToCanvasWithStats,
  type TemplateSlide,
} from "../../../../../lib/templateSlideCanvas";
import { buildGoogleFontsUrls, ensureGoogleFontsLoaded, loadGoogleFontsOnce } from "../../../../../constant/googleFonts";
import { buildPolygonLayout, mergeBuckets, type SlidePayloadV2 } from "../../../../../lib/polygon";
import { QRCodeSVG } from "qrcode.react";
import { renderToStaticMarkup } from "react-dom/server";

type CaptureSlideKey = "slide1" | "slide2" | "slide3" | "slide4";

const CAPTURE_ORDER: CaptureSlideKey[] = ["slide1", "slide2", "slide3", "slide4"];
const CAPTURE_SIZE = { w: 500, h: 700 };
const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

const buildCardSlidesScopeKeys = () => {
  try {
    const storedProduct = JSON.parse(localStorage.getItem("selectedProduct") || "{}");
    const productKey =
      storedProduct?.id && storedProduct?.type ? `${storedProduct.type}:${storedProduct.id}` : "";
    const selectedVariant = JSON.parse(localStorage.getItem("selectedVariant") || "{}");
    return resolveSlidesScopeCandidates({
      includeStoredDraft: true,
      productKey,
      category:
        localStorage.getItem("selectedCategory") ||
        storedProduct?.category ||
        "",
      cardSize: localStorage.getItem("selectedSize") || selectedVariant?.key || "",
    });
  } catch {
    return resolveSlidesScopeCandidates({ includeStoredDraft: true });
  }
};

const toNum = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const firstDefined = (...values: any[]) => {
  for (const value of values) {
    if (value === 0 || value === false) return value;
    if (typeof value === "string") {
      if (value.trim()) return value;
      continue;
    }
    if (value != null) return value;
  }
  return undefined;
};

const normalizeAlign = (value: unknown): "left" | "center" | "right" => {
  const text = String(value ?? "").toLowerCase().trim();
  if (text === "start" || text === "left") return "left";
  if (text === "end" || text === "right") return "right";
  return "center";
};

const normalizeFontWeight = (value: unknown, fallback = 400) => {
  if (typeof value === "boolean") return value ? 700 : 400;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
};

const buildQrSvgDataUrl = (value: string, size: number) => {
  const safeValue = String(value ?? "").trim();
  if (!safeValue) return "";
  const safeSize = Math.max(48, Math.min(256, Math.round(toNum(size, 72))));
  try {
    const markup = renderToStaticMarkup(
      <QRCodeSVG value={safeValue} size={safeSize} includeMargin={false} />
    );
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  } catch {
    return "";
  }
};

const qrPresetFor = (slideId: number, kind: "video" | "audio") => {
  if (slideId === 2) {
    return {
      bgSrc: kind === "audio" ? "/assets/images/audio-qr-tips.png" : "/assets/images/video-qr-tips.png",
      cardWidth: 350,
      cardHeight: 200,
      qrOffsetX: 28,
      qrOffsetY: 33,
      defaultQrSize: 70,
    };
  }
  if (slideId === 3) {
    return {
      bgSrc: kind === "audio" ? "/assets/images/audio-qr-tips.png" : "/assets/images/video-qr-tips.png",
      cardWidth: 300,
      cardHeight: 200,
      qrOffsetX: 25,
      qrOffsetY: 50,
      defaultQrSize: 70,
    };
  }
  if (slideId === 4) {
    return {
      bgSrc: kind === "audio" ? "/assets/images/audio-qr-tips.png" : "/assets/images/video-qr-tips.png",
      cardWidth: CAPTURE_SIZE.w,
      cardHeight: kind === "audio" ? 190 : 180,
      qrOffsetX: kind === "audio" ? 65 : 58,
      qrOffsetY: kind === "audio" ? 57 : 49,
      defaultQrSize: 72,
    };
  }
  return {
    bgSrc: kind === "audio" ? "/assets/images/audio-qr-tips.png" : "/assets/images/video-qr-tips.png",
    cardWidth: 320,
    cardHeight: 200,
    qrOffsetX: 28,
    qrOffsetY: 40,
    defaultQrSize: 70,
  };
};

const mapQrElements = (id: number, payload?: SlidePayloadV2 | null) => {
  const elements: TemplateSlide["elements"] = [];

  const addQr = (kind: "video" | "audio", box?: { url?: string | null; x?: number; y?: number; zIndex?: number; width?: number; height?: number } | null) => {
    const url = String(box?.url ?? "").trim();
    if (!url) return;
    const preset = qrPresetFor(id, kind);
    const x = toNum(box?.x, 0);
    const y = toNum(box?.y, 0);
    const zIndex = toNum(box?.zIndex, 900);
    const qrSize = Math.max(
      56,
      Math.min(120, toNum(firstDefined(box?.width, box?.height, preset.defaultQrSize), preset.defaultQrSize))
    );
    const qrSrc = buildQrSvgDataUrl(url, qrSize);

    elements.push({
      id: `qr-${kind}-bg-${id}`,
      type: "image",
      src: preset.bgSrc,
      x,
      y,
      width: preset.cardWidth,
      height: preset.cardHeight,
      zIndex,
    });

    if (qrSrc) {
      elements.push({
        id: `qr-${kind}-code-${id}`,
        type: "sticker",
        src: qrSrc,
        x: x + preset.qrOffsetX,
        y: y + preset.qrOffsetY,
        width: qrSize,
        height: qrSize,
        zIndex: zIndex + 2,
      });
    }
  };

  addQr("video", payload?.qrVideo);
  addQr("audio", payload?.qrAudio);
  return elements;
};

const mapPolygonSlideToTemplateSlide = (id: number, payload?: SlidePayloadV2 | null): TemplateSlide => {
  const rawBgColor = String(payload?.bg?.color ?? "").trim();
  const normalizedBgColor = !rawBgColor || rawBgColor.toLowerCase() === "transparent" ? "#ffffff" : rawBgColor;

  const bgFrames = mergeBuckets(payload?.layout?.bgFrames)
    .filter((el: any) => String(el?.src ?? "").trim())
    .map((el: any) => ({
      id: String(el?.id ?? `bg-${id}-${Math.random()}`),
      type: "image" as const,
      src: String(el?.src ?? ""),
      x: toNum(el?.x, 0),
      y: toNum(el?.y, 0),
      width: toNum(el?.width, 0),
      height: toNum(el?.height, 0),
      zIndex: toNum(el?.zIndex, 1),
    }));

  const layoutStickers = mergeBuckets(payload?.layout?.stickers)
    .filter((el: any) => String(el?.sticker ?? "").trim())
    .map((el: any) => ({
      id: String(el?.id ?? `lst-${id}-${Math.random()}`),
      type: "sticker" as const,
      src: String(el?.sticker ?? ""),
      x: toNum(el?.x, 0),
      y: toNum(el?.y, 0),
      width: toNum(el?.width, 0),
      height: toNum(el?.height, 0),
      zIndex: toNum(el?.zIndex, 40),
    }));

  const staticTexts = Array.isArray(payload?.layout?.staticText)
    ? payload.layout.staticText
        .filter((text: any) => String(text?.text ?? "").trim().length > 0)
        .map((text: any) => ({
          id: String(text?.id ?? `stxt-${id}-${Math.random()}`),
          type: "text" as const,
          text: String(text?.text ?? ""),
          x: toNum(text?.x, 0),
          y: toNum(text?.y, 0),
          width: toNum(text?.width, 0),
          height: toNum(text?.height, 0),
          zIndex: toNum(text?.zIndex, 80),
          color: String(text?.color ?? "#111111"),
          fontSize: toNum(text?.fontSize, 20),
          fontFamily: String(text?.fontFamily ?? "Arial"),
          fontWeight: normalizeFontWeight(text?.fontWeight, 400),
          fontStyle: text?.italic ? "italic" : "normal",
          textDecoration: "none",
          lineHeight: 1.16,
          align: normalizeAlign(text?.textAlign),
          rotation: toNum(text?.rotation, 0),
        }))
    : [];

  const userImages = mergeBuckets(payload?.user?.images)
    .filter((el: any) => String(el?.src ?? "").trim())
    .map((el: any) => ({
      id: String(el?.id ?? `uimg-${id}-${Math.random()}`),
      type: "image" as const,
      src: String(el?.src ?? ""),
      x: toNum(el?.x, 0),
      y: toNum(el?.y, 0),
      width: toNum(el?.width, 0),
      height: toNum(el?.height, 0),
      zIndex: toNum(el?.zIndex, 120),
    }));

  const userStickers = mergeBuckets(payload?.user?.stickers)
    .filter((el: any) => String(el?.sticker ?? "").trim())
    .map((el: any) => ({
      id: String(el?.id ?? `ust-${id}-${Math.random()}`),
      type: "sticker" as const,
      src: String(el?.sticker ?? ""),
      x: toNum(el?.x, 0),
      y: toNum(el?.y, 0),
      width: toNum(el?.width, 0),
      height: toNum(el?.height, 0),
      zIndex: toNum(el?.zIndex, 160),
    }));

  const freeTexts = Array.isArray(payload?.user?.freeTexts)
    ? payload.user.freeTexts
        .filter((text: any) => String(text?.value ?? "").trim().length > 0)
        .map((text: any) => ({
          id: String(text?.id ?? `utxt-${id}-${Math.random()}`),
          type: "text" as const,
          text: String(text?.value ?? ""),
          x: toNum(text?.position?.x, 0),
          y: toNum(text?.position?.y, 0),
          width: toNum(text?.size?.width, 0),
          height: toNum(text?.size?.height, 0),
          zIndex: toNum(text?.zIndex, 220),
          color: String(text?.fontColor ?? "#111111"),
          fontSize: toNum(text?.fontSize, 20),
          fontFamily: String(text?.fontFamily ?? "Arial"),
          fontWeight: normalizeFontWeight(text?.fontWeight, 400),
          fontStyle: "normal",
          textDecoration: "none",
          lineHeight: toNum(text?.lineHeight, 1.16),
          align: normalizeAlign(text?.textAlign),
          rotation: toNum(text?.rotation, 0),
        }))
    : [];

  const oneText = (() => {
    if (!payload?.flags?.showOneText) return [] as any[];
    const value = String(payload?.oneText?.value ?? "").trim();
    if (!value) return [] as any[];
    return [
      {
        id: `one-${id}`,
        type: "text" as const,
        text: value,
        x: 8,
        y: 8,
        width: CAPTURE_SIZE.w - 16,
        height: CAPTURE_SIZE.h - 16,
        zIndex: 280,
        color: String(payload?.oneText?.fontColor ?? "#111111"),
        fontSize: toNum(payload?.oneText?.fontSize, 22),
        fontFamily: String(payload?.oneText?.fontFamily ?? "Arial"),
        fontWeight: normalizeFontWeight(payload?.oneText?.fontWeight, 400),
        fontStyle: "normal",
        textDecoration: "none",
        lineHeight: toNum(payload?.oneText?.lineHeight, 1.16),
        align: normalizeAlign(payload?.oneText?.textAlign),
        rotation: toNum(payload?.oneText?.rotation, 0),
      },
    ];
  })();

  const multipleTexts = (() => {
    if (!payload?.flags?.multipleText) return [] as any[];
    const rows = Array.isArray(payload?.multipleTexts) ? payload.multipleTexts : [];
    return rows
      .map((entry: any, idx: number) => {
        const value = String(firstDefined(entry?.value, entry?.text, "") ?? "").trim();
        if (!value) return null;
        return {
          id: String(entry?.id ?? `multi-${id}-${idx}`),
          type: "text" as const,
          text: value,
          x: 8,
          y: 8 + idx * 220,
          width: CAPTURE_SIZE.w - 16,
          height: 210,
          zIndex: 300 + idx,
          color: String(
            firstDefined(entry?.fontColor, entry?.fontColor1, entry?.fontColor2, entry?.fontColor3, "#111111"),
          ),
          fontSize: toNum(firstDefined(entry?.fontSize, entry?.fontSize1, entry?.fontSize2, entry?.fontSize3, 22), 22),
          fontFamily: String(
            firstDefined(entry?.fontFamily, entry?.fontFamily1, entry?.fontFamily2, entry?.fontFamily3, "Arial"),
          ),
          fontWeight: normalizeFontWeight(
            firstDefined(entry?.fontWeight, entry?.fontWeight1, entry?.fontWeight2, entry?.fontWeight3, 400),
            400,
          ),
          fontStyle: "normal",
          textDecoration: "none",
          lineHeight: toNum(firstDefined(entry?.lineHeight, entry?.lineHeight1, entry?.lineHeight2, entry?.lineHeight3, 1.16), 1.16),
          align: normalizeAlign(firstDefined(entry?.textAlign, entry?.textAlign1, entry?.textAlign2, entry?.textAlign3, "center")),
          rotation: toNum(firstDefined(entry?.rotation, entry?.rotation1, entry?.rotation2, entry?.rotation3, 0), 0),
        };
      })
      .filter(Boolean) as any[];
  })();

  const aiImage = payload?.ai?.imageUrl
    ? [
        {
          id: `ai-${id}`,
          type: "image" as const,
          src: String(payload.ai.imageUrl),
          x: toNum(payload.ai.x, 0),
          y: toNum(payload.ai.y, 0),
          width: toNum(payload.ai.width, 0),
          height: toNum(payload.ai.height, 0),
          zIndex: 350,
        },
      ]
    : [];

  const qrElements = mapQrElements(id, payload);

  return {
    id,
    label: `slide${id}`,
    bgColor: normalizedBgColor,
    elements: [
      ...bgFrames,
      ...layoutStickers,
      ...staticTexts,
      ...userImages,
      ...userStickers,
      ...freeTexts,
      ...oneText,
      ...multipleTexts,
      ...qrElements,
      ...aiImage,
    ],
  };
};

const PreviewBookCard = () => {
  // currentLocation is 1..(numOfPapers+1) for the flip-book
  const [currentLocation, setCurrentLocation] = useState(1);
  // single index for mobile 1..4
  const [mobileIndex, setMobileIndex] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const isIosWebKit = useMemo(() => isIosTouchDevice(), []);
  const slide1Ctx = useSlide1();
  const slide2Ctx = useSlide2();
  const slide3Ctx = useSlide3();
  const slide4Ctx = useSlide4();


  const isMobile = useMediaQuery("(max-width:500px)");
  const previewAreaRef = useRef<HTMLDivElement | null>(null);
  const [previewArea, setPreviewArea] = useState({ w: 0, h: 0 });
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const onResize = () => {
      if (typeof window === "undefined") return;
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!previewAreaRef.current || typeof ResizeObserver === "undefined") return;
    const obs = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      setPreviewArea({ w: cr.width, h: cr.height });
    });
    obs.observe(previewAreaRef.current);
    return () => obs.disconnect();
  }, []);

  const numOfPapers = 2;
  const maxLocation = numOfPapers + 1;

  const slides = useMemo(() => [<Slide1 key="s1" />, <Slide2 key="s2" />, <Slide3 key="s3" />, <Slide4 key="s4" />], []);

  const goNextPage = () => {
    if (isMobile) {
      setMobileIndex((i) => Math.min(i + 1, slides.length));
      return;
    }
    if (currentLocation < maxLocation) setCurrentLocation((prev) => prev + 1);
  };

  const goPrevPage = () => {
    if (isMobile) {
      setMobileIndex((i) => Math.max(i - 1, 1));
      return;
    }
    if (currentLocation > 1) setCurrentLocation((prev) => prev - 1);
  };

  const getBookTransform = () => {
    if (currentLocation === 1) return "translateX(0%)";
    if (currentLocation === maxLocation) return "translateX(100%)";
    return "translateX(50%)";
  };

  const isPrevDisabled = isMobile ? mobileIndex === 1 : currentLocation === 1;
  const isNextDisabled = isMobile ? mobileIndex === slides.length : currentLocation === maxLocation;

  useEffect(() => {
    try {
      sessionStorage.setItem("card_preview_downloaded", "0");
    } catch {}
  }, []);

  const BASE_PAGE = { w: 500, h: 700 };
  const BASE_BOOK = { w: 1000, h: 700 };
  const areaW = Math.max(260, (previewArea.w || viewport.w || 0) - 8);
  const areaH = Math.max(320, (previewArea.h || viewport.h || 0) - 8);
  const mobileScale = Math.min(1, areaW / BASE_PAGE.w, areaH / BASE_PAGE.h);
  const bookScale = Math.min(1, areaW / BASE_BOOK.w, areaH / BASE_BOOK.h);
  const captureRefs = useRef<Record<CaptureSlideKey, HTMLDivElement | null>>({
    slide1: null,
    slide2: null,
    slide3: null,
    slide4: null,
  });

  const setCaptureRef = (key: CaptureSlideKey) => (node: HTMLDivElement | null) => {
    captureRefs.current[key] = node;
  };

  const waitForNodeAssets = useCallback(async (node: HTMLElement) => {
    const images = Array.from(node.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            const el = img as HTMLImageElement;
            if (el.complete) {
              resolve();
              return;
            }
            const done = () => resolve();
            el.addEventListener("load", done, { once: true });
            el.addEventListener("error", done, { once: true });
          }),
      ),
    );
    if ((document as any)?.fonts?.ready) {
      try {
        await (document as any).fonts.ready;
      } catch {}
    }
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  }, []);

  const captureCardSlides = useCallback(async () => {
    const captured: string[] = [];

    for (let i = 0; i < CAPTURE_ORDER.length; i += 1) {
      const key = CAPTURE_ORDER[i];
      const node = captureRefs.current[key];
      if (!node) {
        captured.push("");
        continue;
      }
      await waitForNodeAssets(node);
      let capturedUrl = "";
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const rect = node.getBoundingClientRect();
          const maxSide = Math.max(rect.width || CAPTURE_SIZE.w, rect.height || CAPTURE_SIZE.h);
          const ratio = maxSide ? 1800 / maxSide : 1.5;
          const pixelRatio = Math.min(2.25, Math.max(1, ratio));
          capturedUrl = await toJpeg(node, {
            quality: 0.9,
            pixelRatio,
            backgroundColor: "#ffffff",
            cacheBust: true,
            imagePlaceholder: TRANSPARENT_PIXEL,
            width: CAPTURE_SIZE.w,
            height: CAPTURE_SIZE.h,
            style: { transform: "none" },
          });
          if (capturedUrl.startsWith("data:image/")) break;
        } catch {}
        await new Promise((resolve) => setTimeout(resolve, 60));
      }
      captured.push(capturedUrl);
      if (i < CAPTURE_ORDER.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    const slidesObj = Object.fromEntries(
      CAPTURE_ORDER.map((_, idx) => {
        const dataUrl = captured[idx];
        return [`slide${idx + 1}`, dataUrl];
      }).filter(([, dataUrl]) => typeof dataUrl === "string" && dataUrl.startsWith("data:image/")),
    ) as Record<string, string>;

    return {
      captured,
      slidesObj,
      validCount: Object.keys(slidesObj).length,
    };
  }, [waitForNodeAssets]);

  const captureCardSlidesFromCanvasRenderer = useCallback(async () => {
    const polygon = buildPolygonLayout(slide1Ctx, slide2Ctx, slide3Ctx, slide4Ctx, {
      onlySelectedImages: true,
    });
    const slides = [
      mapPolygonSlideToTemplateSlide(1, polygon?.slides?.slide1),
      mapPolygonSlideToTemplateSlide(2, polygon?.slides?.slide2),
      mapPolygonSlideToTemplateSlide(3, polygon?.slides?.slide3),
      mapPolygonSlideToTemplateSlide(4, polygon?.slides?.slide4),
    ];

    const fonts = collectTemplateSlideFonts(slides);
    if (fonts.length) {
      const urls = buildGoogleFontsUrls(fonts);
      loadGoogleFontsOnce(urls);
      await ensureGoogleFontsLoaded(urls);
    }
    if ((document as any)?.fonts?.ready) {
      try {
        await (document as any).fonts.ready;
      } catch {}
    }

    const captured: string[] = [];
    for (let i = 0; i < slides.length; i += 1) {
      const slide = slides[i];
      try {
        const rendered = await renderTemplateSlideToCanvasWithStats(slide, {
          width: CAPTURE_SIZE.w,
          height: CAPTURE_SIZE.h,
          pixelRatio: 2.5,
          backgroundColor: "#ffffff",
        });
        if (rendered.expectedAssets > 0 && rendered.drawnAssets < rendered.expectedAssets) {
          captured.push("");
          continue;
        }
        captured.push(rendered.canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        captured.push("");
      }
      if (i < slides.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    const slidesObj = Object.fromEntries(
      CAPTURE_ORDER.map((_, idx) => {
        const dataUrl = captured[idx];
        return [`slide${idx + 1}`, dataUrl];
      }).filter(([, dataUrl]) => typeof dataUrl === "string" && dataUrl.startsWith("data:image/")),
    ) as Record<string, string>;

    return {
      captured,
      slidesObj,
      validCount: Object.keys(slidesObj).length,
    };
  }, [slide1Ctx, slide2Ctx, slide3Ctx, slide4Ctx]);

  const handleDownload = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const domResult = isIosWebKit ? null : await captureCardSlides();
      const iosCanvasResult = isIosWebKit ? await captureCardSlidesFromCanvasRenderer() : null;
      const activeResult = iosCanvasResult ?? domResult ?? { captured: [], slidesObj: {}, validCount: 0 };
      const { captured, slidesObj, validCount } = activeResult;
      const expectedCount = CAPTURE_ORDER.length;
      const previewOnly = validCount < expectedCount;

      try {
        sessionStorage.removeItem("slides");
        sessionStorage.removeItem("templ_preview_slides");
        sessionStorage.removeItem("templ_preview_key");
        sessionStorage.removeItem("templ_preview_config");
        sessionStorage.setItem("slides_preview_only", previewOnly ? "1" : "0");
        sessionStorage.setItem("rawSlidesCount", String(expectedCount));
        sessionStorage.setItem("card_preview_downloaded", "1");
        sessionStorage.removeItem("capturedSlidesKey");
        if (!previewOnly && validCount) {
          const validList = captured.filter((url) => String(url).startsWith("data:image/"));
          sessionStorage.setItem("capturedSlides", JSON.stringify(validList));
        } else {
          sessionStorage.removeItem("capturedSlides");
        }
      } catch {}

      try {
        if (!previewOnly && validCount) {
          (globalThis as any).__slidesCache = slidesObj;
        } else {
          delete (globalThis as any).__slidesCache;
        }
      } catch {}

      if (!previewOnly && validCount) {
        const scopeKeys = buildCardSlidesScopeKeys();
        void saveSlidesToScopes(scopeKeys, slidesObj);
        void saveSlidesToIdb(slidesObj);
        try {
          const minimal = slidesObj?.slide1 ? JSON.stringify({ slide1: slidesObj.slide1 }) : "{}";
          localStorage.setItem("slides_backup", minimal);
        } catch {}
      } else {
        try {
          localStorage.removeItem("slides_backup");
        } catch {}
        try {
          void clearSlidesFromIdb();
        } catch {}
      }

      if (previewOnly) {
        toast.error("Could not capture the full card preview. Please try again.");
        return;
      }

      navigate(USER_ROUTES.SUBSCRIPTION, {
        state: {
          slides: slidesObj,
          previewOnly: false,
        },
      });
    } catch {
      toast.error("Could not prepare preview. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [captureCardSlides, captureCardSlidesFromCanvasRenderer, downloading, isIosWebKit, navigate]);


  return (
    <>
      <Box sx={{ display: "flex", gap: 3, justifyContent: 'flex-end', alignItems: 'flex-end', m: 'auto', p: 2, mt: -9 }}>
        <LandingButton
          title="Download"
          loading={downloading}
          onClick={handleDownload}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", m: "auto", flexDirection: "column", mt: 4 }}>
        <Box
          ref={previewAreaRef}
          sx={{
            width: "100%",
            maxWidth: "92vw",
            height: isMobile ? "70vh" : "72vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
        {/* MOBILE: one slide at a time */}
        {isMobile ? (
          <div
            style={{
              width: `${BASE_PAGE.w * mobileScale}px`,
              height: `${BASE_PAGE.h * mobileScale}px`,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${BASE_PAGE.w}px`,
                height: `${BASE_PAGE.h}px`,
                transform: `scale(${mobileScale})`,
                transformOrigin: "top left",
                position: "absolute",
                inset: 0,
              }}
            >
              <div
                className="book-container mobile-only"
                style={{ width: `${BASE_PAGE.w}px`, height: `${BASE_PAGE.h}px` }}
              >
                <div
                  className="mobile-slide"
                  aria-live="polite"
                  style={{ width: `${BASE_PAGE.w}px`, height: `${BASE_PAGE.h}px` }}
                >
                  {slides[mobileIndex - 1]}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // DESKTOP/TABLET: 3D flip-book
          <div
            style={{
              width: `${BASE_BOOK.w * bookScale}px`,
              height: `${BASE_BOOK.h * bookScale}px`,
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${BASE_BOOK.w}px`,
                height: `${BASE_BOOK.h}px`,
                transform: `scale(${bookScale})`,
                transformOrigin: "top left",
                position: "absolute",
                inset: 0,
              }}
            >
              <div className="book-container" style={{ width: `${BASE_BOOK.w}px`, height: `${BASE_BOOK.h}px` }}>
                <div
                  id="book"
                  className="book"
                  style={{
                    transform: getBookTransform(),
                    transition: "transform 0.5s ease",
                  }}
                >

              {/* Paper 1 */}
              <div id="p1" className={`paper ${currentLocation > 1 ? "flipped" : ""}`}
                style={{ zIndex: currentLocation > 1 ? 1 : 2 }}
              >
                <div className="front">
                  <div className="front-content capture-slide" id="sf1">
                    <Slide1 />
                  </div>
                </div>
                <div className="back">
                  <div className="back-content capture-slide" id="b1">
                    <Slide2 />
                  </div>
                </div>
              </div>

              {/* Paper 2 */}
              <div id="p2" className={`paper ${currentLocation > 2 ? "flipped" : ""}`}
                style={{ zIndex: currentLocation > 2 ? 2 : 1 }}
              >
                <div className="front">
                  <div className="front-content capture-slide" id="f2">
                    <Slide3 />
                  </div>
                </div>
                <div className="back">
                  <div className="back-content capture-slide" id="b2">
                    <Slide4 />
                  </div>
                </div>
              </div>

                </div>
              </div>
            </div>
          </div>

        )}
        </Box>

        {/* Controls */}
        <Box sx={{ display: "flex", gap: "10px", alignItems: "center", mt: 3 }}>
          <IconButton
            id="prev-btn"
            onClick={goPrevPage}
            disabled={isPrevDisabled}
            sx={{
              ...changeModuleBtn,
              border: `${isPrevDisabled ? "1px solid gray" : "1px solid #8D6DA1"}`,
            }}
            aria-label="Previous page"
          >
            <KeyboardArrowLeft fontSize="large" />
          </IconButton>

          <IconButton
            id="next-btn"
            onClick={goNextPage}
            disabled={isNextDisabled}
            sx={{
              ...changeModuleBtn,
              border: `${isNextDisabled ? "1px solid gray" : "1px solid #8D6DA1"}`,
            }}
            aria-label="Next page"
          >
            <KeyboardArrowRight fontSize="large" />
          </IconButton>
        </Box>
        <GlobalWatermark />
      </Box>

      <Box
        aria-hidden
        sx={{
          position: "fixed",
          left: 0,
          top: 0,
          opacity: 0.01,
          pointerEvents: "none",
          zIndex: -1,
          transform: "translateZ(0)",
          WebkitTransform: "translateZ(0)",
        }}
      >
        <Box ref={setCaptureRef("slide1")} sx={{ width: `${CAPTURE_SIZE.w}px`, height: `${CAPTURE_SIZE.h}px` }}>
          <Slide1 />
        </Box>
        <Box ref={setCaptureRef("slide2")} sx={{ width: `${CAPTURE_SIZE.w}px`, height: `${CAPTURE_SIZE.h}px` }}>
          <Slide2 />
        </Box>
        <Box ref={setCaptureRef("slide3")} sx={{ width: `${CAPTURE_SIZE.w}px`, height: `${CAPTURE_SIZE.h}px` }}>
          <Slide3 />
        </Box>
        <Box ref={setCaptureRef("slide4")} sx={{ width: `${CAPTURE_SIZE.w}px`, height: `${CAPTURE_SIZE.h}px` }}>
          <Slide4 />
        </Box>
      </Box>
    </>

  );
};

export default PreviewBookCard;

const changeModuleBtn = {
  border: "1px solid #3a7bd5",
  p: 1,
  display: "flex",
  justifyContent: "center",
  color: "#212121",
  alignItems: "center",
  "&.Mui-disabled": {
    color: "gray",
    cursor: "default",
    pointerEvents: "none",
  },
};

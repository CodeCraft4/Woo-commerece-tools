// src/lib/polygon.ts
import * as htmlToImage from "html-to-image";

/* ----------------------------- Shared helpers ---------------------------- */

const pick = <T = any>(o: any, keys: string[], d?: any): T =>
  (keys.find((k) => o && o[k] !== undefined)
    ? (o[keys.find((k) => o[k] !== undefined)!] as T)
    : d) as T;

const splitBucket = <T extends { locked?: boolean }>(arr: T[] = []) => ({
  editable: arr.filter((i) => !i.locked),
  locked: arr.filter((i) => i.locked),
});

const call = (ctx: any, fnName: string, ...args: any[]) => {
  const fn = ctx?.[fnName];
  if (typeof fn === "function") fn(...args);
};

/* --------------------------------- Types --------------------------------- */

export type Bucket<T> = {
  editable: T[];
  locked: T[];
};

export type BgFrame = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  zIndex?: number;
  rotation?: number;
  locked?: boolean;
};

export type UserImage = {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  filter?: string;
  shapePath?: string;
  locked?: boolean;
};

export type Sticker = {
  id?: string;
  sticker: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  locked?: boolean;
};

export type FreeText = {
  id: string;
  value: string;
  fontSize: number;
  fontWeight: number | string;
  fontColor: string;
  fontFamily: string;
  textAlign: "start" | "center" | "end" | "left" | "right";
  verticalAlign?: "top" | "center" | "bottom";
  rotation?: number;
  lineHeight?: number;
  letterSpacing?: number | string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex?: number;
  locked?: boolean;
};

export type StaticText = {
  id?: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "center" | "bottom";
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: number | string;
  italic?: boolean;
  rotation?: number;
  zIndex?: number;
  locked?: boolean;
};

export type QRBox = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  url?: string | null;
};

export type AIImage = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  imageUrl?: string | null;
};

/* -------------------------- Slide payload (v2) --------------------------- */

export type SlidePayloadV2 = {
  bg: {
    color?: string | null;
    image?: string | null;
    rect?: { x: number; y: number; width: number; height: number } | null;
    locked?: boolean;
  };
  flags: {
    showOneText?: boolean;
    multipleText?: boolean;
    isAIImage?: boolean;
  };
  oneText?: {
    value?: string;
    fontSize?: number;
    fontWeight?: number | string;
    fontColor?: string;
    fontFamily?: string;
    textAlign?: "start" | "center" | "end" | "left" | "right";
    verticalAlign?: "top" | "center" | "bottom";
    rotation?: number;
    lineHeight?: number;
    letterSpacing?: number | string;
  };
  multipleTexts?: Array<any>;
  layout: {
    bgFrames: Bucket<BgFrame>;
    stickers: Bucket<Sticker>;
    staticText: StaticText[];
  };
  user: {
    images: Bucket<UserImage>;
    stickers: Bucket<Sticker>;
    freeTexts: FreeText[];
    /** Persist selection separately (do NOT filter images when saving). */
    selectedImageIds?: string[];
  };
  qrVideo?: QRBox | null;
  qrAudio?: QRBox | null;
  ai?: AIImage | null;
};

export type PolygonLayoutV2 = {
  version: 2;
  slides: {
    slide1: SlidePayloadV2;
    slide2: SlidePayloadV2;
    slide3: SlidePayloadV2;
    slide4: SlidePayloadV2;
  };
};

type BuildOptions = {
  onlySelectedImages?: boolean; // ✅ new
};

/* -------------------------- Optional: merge helper ------------------------- */

export const mergeBuckets = <T>(b?: Bucket<T>) =>
  b ? [...(b.editable || []), ...(b.locked || [])] : [];

type LayoutNormEl = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src?: string | null;
  zIndex?: number;
  rotation?: number;
  isEditable?: boolean;
  locked?: boolean;
  clipPath?: any;
};

type LayoutNormSticker = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  rotation?: number;
  sticker?: string | null;
  isEditable?: boolean;
  locked?: boolean;
};

type LayoutNormText = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "center" | "bottom";
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: number | string;
  italic?: boolean;
  rotation?: number;
  lineHeight?: number;
  letterSpacing?: number | string;
  zIndex?: number;
  isEditable?: boolean;
  locked?: boolean;
};

type LayoutNorm = {
  elements: LayoutNormEl[];
  stickers: LayoutNormSticker[];
  textElements: LayoutNormText[];
};

const num = (v: any, d = 0) => (typeof v === "number" && !Number.isNaN(v) ? v : d);
const str = (v: any, d = "") => (typeof v === "string" ? v : d);
const bool = (v: any, d = false) => (typeof v === "boolean" ? v : d);
const idOrIdx = (obj: any, idx: number, prefix: string) => str(obj?.id, `${prefix}-${idx}`);

const toElement = (obj: any, i: number, editable: boolean, prefix = "bg"): LayoutNormEl => ({
  id: idOrIdx(obj, i, prefix),
  x: num(obj?.x, 0),
  y: num(obj?.y, 0),
  width: num(obj?.width, num(obj?.w, 200)),
  height: num(obj?.height, num(obj?.h, 200)),
  src: obj?.src ?? obj?.image ?? obj?.url ?? null,
  zIndex: num(obj?.zIndex, 1),
  rotation: num(obj?.rotation, 0),
  isEditable: editable,
  locked: bool(obj?.locked, !editable),
  clipPath: obj?.clipPath ?? obj?.shapePath ?? null,
});

const toSticker = (obj: any, i: number, editable: boolean, prefix = "st"): LayoutNormSticker => ({
  id: idOrIdx(obj, i, prefix),
  x: num(obj?.x, 0),
  y: num(obj?.y, 0),
  width: num(obj?.width, 80),
  height: num(obj?.height, 80),
  zIndex: num(obj?.zIndex, 1),
  rotation: num(obj?.rotation, 0),
  sticker: obj?.sticker ?? obj?.src ?? obj?.image ?? obj?.url ?? null,
  isEditable: editable,
  locked: bool(obj?.locked, !editable),
});

const toText = (obj: any, i: number, editable: boolean, prefix = "te"): LayoutNormText => {
  const tAlign = str(obj?.textAlign, "center");
  const vAlign = str(obj?.verticalAlign, "center");
  return {
    id: idOrIdx(obj, i, prefix),
    x: num(obj?.x, num(obj?.position?.x, 0)),
    y: num(obj?.y, num(obj?.position?.y, 0)),
    width: num(obj?.width, num(obj?.w, num(obj?.size?.width, 240))),
    height: num(obj?.height, num(obj?.h, num(obj?.size?.height, 60))),
    text: str(obj?.text ?? obj?.value, ""),
    textAlign: (tAlign === "start" ? "left" : tAlign === "end" ? "right" : tAlign) as LayoutNormText["textAlign"],
    verticalAlign: (["top", "bottom"].includes(vAlign) ? (vAlign as any) : "center") as LayoutNormText["verticalAlign"],
    fontSize: obj?.fontSize,
    fontFamily: obj?.fontFamily,
    color: obj?.fontColor ?? obj?.color,
    fontWeight: obj?.fontWeight ?? obj?.bold,
    italic: obj?.italic ?? false,
    rotation: obj?.rotation,
    lineHeight: obj?.lineHeight,
    letterSpacing: obj?.letterSpacing,
    zIndex: obj?.zIndex ?? 1,
    isEditable: editable,
    locked: bool(obj?.locked, !editable),
  };
};

const normalizeSlideToLayout = (slide: SlidePayloadV2): LayoutNorm => {
  const layout = slide?.layout ?? ({} as any);
  const user = slide?.user ?? ({} as any);
  const bg = slide?.bg ?? ({} as any);
  const rect = bg?.rect ?? { x: 0, y: 0, width: 0, height: 0 };
  const bgLocked = bool(bg?.locked, false);
  const bgEditable =
    typeof (bg as any)?.editable === "boolean"
      ? !!(bg as any)?.editable
      : !bgLocked;

  const out: LayoutNorm = { elements: [], stickers: [], textElements: [] };

  out.elements.push(...(layout?.bgFrames?.locked ?? []).map((o: any, i: number) => toElement(o, i, false, "bg-locked")));
  out.elements.push(...(layout?.bgFrames?.editable ?? []).map((o: any, i: number) => toElement(o, i, true, "bg-edit")));

  if (bg?.image) {
    out.elements.push(
      toElement(
        {
          id: "bg-image",
          x: num(rect.x, 0),
          y: num(rect.y, 0),
          width: num(rect.width, 0),
          height: num(rect.height, 0),
          src: bg.image,
          zIndex: 0,
          rotation: 0,
          locked: bgLocked,
        },
        9990,
        bgEditable && !bgLocked,
        "bg",
      ),
    );
  }

  out.elements.push(...(user?.images?.locked ?? []).map((o: any, i: number) => toElement(o, i, false, "uimg-locked")));
  out.elements.push(...(user?.images?.editable ?? []).map((o: any, i: number) => toElement(o, i, true, "uimg-edit")));

  out.stickers.push(...(layout?.stickers?.locked ?? []).map((o: any, i: number) => toSticker(o, i, false, "st-locked")));
  out.stickers.push(...(layout?.stickers?.editable ?? []).map((o: any, i: number) => toSticker(o, i, true, "st-edit")));
  out.stickers.push(...(user?.stickers?.locked ?? []).map((o: any, i: number) => toSticker(o, i, false, "ust-locked")));
  out.stickers.push(...(user?.stickers?.editable ?? []).map((o: any, i: number) => toSticker(o, i, true, "ust-edit")));

  if (slide?.qrVideo?.url) {
    out.stickers.push(
      toSticker(
        {
          id: "qr-video",
          x: num(slide.qrVideo.x, 56),
          y: num(slide.qrVideo.y, 404),
          width: num(slide.qrVideo.width, 70),
          height: num(slide.qrVideo.height, 105),
          zIndex: num(slide.qrVideo.zIndex, 1000),
          url: slide.qrVideo.url,
        },
        9991,
        false,
        "qr",
      ),
    );
  }

  if (slide?.qrAudio?.url) {
    out.stickers.push(
      toSticker(
        {
          id: "qr-audio",
          x: num(slide.qrAudio.x, 56),
          y: num(slide.qrAudio.y, 404),
          width: num(slide.qrAudio.width, 70),
          height: num(slide.qrAudio.height, 105),
          zIndex: num(slide.qrAudio.zIndex, 1000),
          url: slide.qrAudio.url,
        },
        9992,
        false,
        "qr",
      ),
    );
  }

  const staticText = layout?.staticText ?? (layout as any)?.textElements ?? [];
  const canEdit = (o: any, fallback = true) =>
    typeof o?.editable === "boolean"
      ? !!o.editable
      : typeof o?.isEditable === "boolean"
        ? !!o.isEditable
        : typeof o?.locked === "boolean"
          ? !o.locked
          : fallback;
  out.textElements.push(
    ...(staticText ?? []).map((o: any, i: number) => toText(o, i, canEdit(o, !o?.locked), "te"))
  );
  out.textElements.push(
    ...(user?.freeTexts ?? []).map((o: any, i: number) => toText(o, i, !o?.locked, "ut"))
  );
  out.textElements.push(
    ...(slide?.multipleTexts ?? []).map((o: any, i: number) => toText(o, i, canEdit(o, true), "mte"))
  );

  if (slide?.oneText && str(slide.oneText.value, "").trim().length > 0) {
    out.textElements.push(
      toText(
        {
          id: "single-text",
          x: num(slide.oneText.x, 24),
          y: num(slide.oneText.y, 24),
          width: num(slide.oneText.width, 360),
          height: num(slide.oneText.height, 120),
          text: slide.oneText.value,
          fontSize: slide.oneText.fontSize,
          fontFamily: slide.oneText.fontFamily,
          fontColor: slide.oneText.fontColor,
          fontWeight: slide.oneText.fontWeight,
          textAlign: slide.oneText.textAlign,
          verticalAlign: slide.oneText.verticalAlign,
          rotation: slide.oneText.rotation,
          lineHeight: slide.oneText.lineHeight,
          letterSpacing: slide.oneText.letterSpacing,
          zIndex: 1,
        },
        9993,
        true,
        "ote",
      ),
    );
  }

  if (slide?.flags?.isAIImage === true) {
    out.elements = out.elements.map((e) => ({ ...e, isEditable: false }));
    out.stickers = out.stickers.map((s) => ({ ...s, isEditable: false }));
    out.textElements = out.textElements.map((t) => ({ ...t, isEditable: false }));
  }

  return out;
};

/* ------------------------------ Normalizer ------------------------------ */

const normalizeSlideV2 = (ctx: any, opts?: BuildOptions): SlidePayloadV2 => {
  const rect = pick<any>(
    ctx,
    ["bgRect1", "bgRect2", "bgRect3", "bgRect4", "bgRect"],
    null
  );

  const bg = {
    color: pick<string>(
      ctx,
      ["bgColor1", "bgColor2", "bgColor3", "bgColor4", "bgColor"],
      null
    ),
    image: pick<string>(
      ctx,
      ["bgImage1", "bgImage2", "bgImage3", "bgImage4", "bgImage"],
      null
    ),
    rect: rect
      ? {
          x: rect.x ?? 0,
          y: rect.y ?? 0,
          width: rect.width ?? 0,
          height: rect.height ?? 0,
        }
      : null,
    locked: !!pick(
      ctx,
      ["bgLocked1", "bgLocked2", "bgLocked3", "bgLocked4", "bgLocked"],
      false
    ),
  };

  const flags = {
    showOneText: !!pick(
      ctx,
      [
        "showOneTextRightSideBox1",
        "showOneTextRightSideBox2",
        "showOneTextRightSideBox3",
        "showOneTextRightSideBox4",
        "showOneTextRightSideBox",
      ],
      false
    ),
    multipleText: !!pick(
      ctx,
      [
        "multipleTextValue1",
        "multipleTextValue2",
        "multipleTextValue3",
        "multipleTextValue4",
        "multipleTextValue",
      ],
      false
    ),
    isAIImage: !!pick(
      ctx,
      ["isAIimage1", "isAIimage2", "isAIimage3", "isAIimage4", "isAIimage"],
      false
    ),
  };

  const oneText = {
    value: pick<string>(
      ctx,
      [
        "oneTextValue1",
        "oneTextValue2",
        "oneTextValue3",
        "oneTextValue4",
        "oneTextValue",
      ],
      ""
    ),
    fontSize: pick<number>(ctx, [
      "fontSize1",
      "fontSize2",
      "fontSize3",
      "fontSize4",
      "fontSize",
    ]),
    fontWeight: pick(ctx, [
      "fontWeight1",
      "fontWeight2",
      "fontWeight3",
      "fontWeight4",
      "fontWeight",
    ]),
    fontColor: pick<string>(ctx, [
      "fontColor1",
      "fontColor2",
      "fontColor3",
      "fontColor4",
      "fontColor",
    ]),
    fontFamily: pick<string>(ctx, [
      "fontFamily1",
      "fontFamily2",
      "fontFamily3",
      "fontFamily4",
      "fontFamily",
    ]),
    textAlign: pick(ctx, [
      "textAlign1",
      "textAlign2",
      "textAlign3",
      "textAlign4",
      "textAlign",
    ]),
    verticalAlign: pick(ctx, [
      "verticalAlign1",
      "verticalAlign2",
      "verticalAlign3",
      "verticalAlign4",
      "verticalAlign",
    ]),
    rotation: pick<number>(
      ctx,
      ["rotation1", "rotation2", "rotation3", "rotation4", "rotation"],
      0
    ),
    lineHeight: pick<number>(ctx, [
      "lineHeight1",
      "lineHeight2",
      "lineHeight3",
      "lineHeight4",
      "lineHeight",
    ]),
    letterSpacing: pick(ctx, [
      "letterSpacing1",
      "letterSpacing2",
      "letterSpacing3",
      "letterSpacing4",
      "letterSpacing",
    ]),
  };

  const multipleTexts = pick<any[]>(
    ctx,
    ["texts1", "texts2", "texts3", "texts4", "texts"],
    []
  )?.map((t) => ({ ...t }));

  const layoutRaw = pick<any>(
    ctx,
    ["layout1", "layout2", "layout3", "layout4", "layout"],
    null
  );

  const layoutBgFramesAll: BgFrame[] = (layoutRaw?.elements ?? []).map(
    (el: any) => ({
      id: el.id,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      src: el.src,
      zIndex: el.zIndex,
      rotation: el.rotation,
      locked: !!el.locked,
    })
  );

  const layoutStickersAll: Sticker[] = (layoutRaw?.stickers ?? []).map(
    (st: any) => ({
      id: st.id,
      sticker: st.sticker,
      x: st.x,
      y: st.y,
      width: st.width,
      height: st.height,
      rotation: st.rotation,
      zIndex: st.zIndex,
      locked: !!st.locked,
    })
  );

  const staticText: StaticText[] = (layoutRaw?.textElements ?? []).map(
    (te: any) => ({
      id: te.id,
      text: te.text,
      x: te.x,
      y: te.y,
      width: te.width,
      height: te.height,
      textAlign: te.textAlign,
      verticalAlign: te.verticalAlign,
      fontSize: te.fontSize,
      fontFamily: te.fontFamily,
      color: te.color,
      fontWeight: te.bold ?? te.fontWeight,
      italic: te.italic,
      rotation: te.rotation,
      zIndex: te.zIndex,
      locked: !!te.locked,
    })
  );

  const layout = {
    bgFrames: splitBucket<BgFrame>(layoutBgFramesAll),
    stickers: splitBucket<Sticker>(layoutStickersAll),
    staticText,
  };

  // ✅ Keep selection but DON'T filter saved images
  const selectedImg = pick<string[]>(
    ctx,
    [
      "selectedImg1",
      "selectedImg2",
      "selectedImg3",
      "selectedImg4",
      "selectedImg",
    ],
    []
  );

  const imagesRaw = pick<any[]>(
    ctx,
    [
      "draggableImages1",
      "draggableImages2",
      "draggableImages3",
      "draggableImages4",
      "draggableImages",
    ],
    []
  );

  // ✅ IMPORTANT: if selection empty, treat as "all selected"
  const selectedFinalIds =
    Array.isArray(selectedImg) && selectedImg.length > 0
      ? selectedImg
      : (imagesRaw ?? []).map((i: any) => i.id);

  const selectedSet = new Set(selectedFinalIds);

  // ✅ Filter ONLY for DB save (optional)
  const imagesForSave = opts?.onlySelectedImages
    ? (imagesRaw ?? []).filter((img: any) => selectedSet.has(img.id))
    : imagesRaw ?? [];

  const userImagesAll: UserImage[] = (imagesForSave ?? []).map((img: any) => ({
    id: img.id,
    src: img.src,
    x: img.x,
    y: img.y,
    width: img.width,
    height: img.height,
    rotation: img.rotation,
    zIndex: img.zIndex,
    filter: img.filter,
    shapePath: img.shapePath,
    locked: !!img.locked,
  }));

  const userStickersAll: Sticker[] = pick<any[]>(
    ctx,
    [
      "selectedStickers1",
      "selectedStickers2",
      "selectedStickers3",
      "selectedStickers4",
      "selectedStickers",
    ],
    []
  )?.map((st) => ({
    id: st.id,
    sticker: st.sticker,
    x: st.x,
    y: st.y,
    width: st.width,
    height: st.height,
    zIndex: st.zIndex,
    rotation: st.rotation,
    locked: !!st.locked,
  }));

  const freeTexts: FreeText[] = pick<any[]>(
    ctx,
    [
      "textElements1",
      "textElements2",
      "textElements3",
      "textElements4",
      "textElements",
    ],
    []
  )?.map((t) => ({
    id: t.id,
    value: t.value,
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    fontColor: t.fontColor,
    fontFamily: t.fontFamily,
    textAlign: t.textAlign,
    verticalAlign: t.verticalAlign,
    rotation: t.rotation,
    zIndex: t.zIndex,
    position: t.position,
    size: t.size,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    locked: !!t.locked,
  }));

  const selectedVideoUrl = pick<string | null>(
    ctx,
    [
      "selectedVideoUrl1",
      "selectedVideoUrl2",
      "selectedVideoUrl3",
      "selectedVideoUrl4",
      "selectedVideoUrl",
    ],
    null
  );

  const user = {
    images: splitBucket<UserImage>(userImagesAll),
    stickers: splitBucket<Sticker>(userStickersAll),
    freeTexts,
    selectedImageIds: selectedFinalIds, // ✅ keep consistent
  };

  const qrPos = pick<any>(
    ctx,
    ["qrPosition1", "qrPosition2", "qrPosition3", "qrPosition4", "qrPosition"],
    {}
  );
  const qrVideo = selectedVideoUrl
    ? ({
        url: selectedVideoUrl,
        x: qrPos?.x,
        y: qrPos?.y,
        width: qrPos?.width,
        height: qrPos?.height,
        zIndex: qrPos?.zIndex,
      } as QRBox)
    : null;

  const selectedAudioUrl = pick<string | null>(
    ctx,
    [
      "selectedAudioUrl1",
      "selectedAudioUrl2",
      "selectedAudioUrl3",
      "selectedAudioUrl4",
      "selectedAudioUrl",
    ],
    null
  );
  const qrAudioPos = pick<any>(
    ctx,
    [
      "qrAudioPosition1",
      "qrAudioPosition2",
      "qrAudioPosition3",
      "qrAudioPosition4",
      "qrAudioPosition",
    ],
    {}
  );
  const qrAudio = selectedAudioUrl
    ? ({
        url: selectedAudioUrl,
        x: qrAudioPos?.x,
        y: qrAudioPos?.y,
        width: qrAudioPos?.width,
        height: qrAudioPos?.height,
        zIndex: qrAudioPos?.zIndex,
      } as QRBox)
    : null;

  const aiEnabled = !!flags.isAIImage;
  const aimage = pick<any>(
    ctx,
    ["aimage1", "aimage2", "aimage3", "aimage4", "aimage"],
    null
  );
  const selectedAIimageUrl = pick<string>(
    ctx,
    [
      "selectedAIimageUrl1",
      "selectedAIimageUrl2",
      "selectedAIimageUrl3",
      "selectedAIimageUrl4",
      "selectedAIimageUrl",
    ],
    null
  );
  const ai: AIImage | null = aiEnabled
    ? {
        x: aimage?.x,
        y: aimage?.y,
        width: aimage?.width,
        height: aimage?.height,
        imageUrl: selectedAIimageUrl,
      }
    : null;

  return {
    bg,
    flags,
    oneText,
    multipleTexts,
    layout,
    user,
    qrVideo,
    qrAudio,
    ai,
  };
};

/* --------------------------- Public build function -------------------------- */

export type PolygonLayout = PolygonLayoutV2;

export const buildPolygonLayout = (
  s1: any,
  s2: any,
  s3: any,
  s4: any,
  opts?: BuildOptions
): PolygonLayoutV2 => ({
  version: 2 as const,
  slides: {
    slide1: normalizeSlideV2(s1, opts),
    slide2: normalizeSlideV2(s2, opts),
    slide3: normalizeSlideV2(s3, opts),
    slide4: normalizeSlideV2(s4, opts),
  },
});

/* ----------------------------- Capture helper ----------------------------- */

export async function captureNodeToPng(
  node: HTMLElement,
  bg?: string
): Promise<string> {
  return htmlToImage.toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: bg ?? getComputedStyle(node).backgroundColor ?? "#ffffff",
    skipFonts: true,
    fontEmbedCSS: "",
  });
}

/* ------------------------ Apply (hydrate) helper ------------------------- */

const isV2Layout = (layout: any): layout is PolygonLayoutV2 =>
  !!layout && layout.version === 2 && !!layout.slides?.slide1;

// function applySlideV2ToContext(
//   payload: SlidePayloadV2,
//   slideCtx: any,
//   n: 1 | 2 | 3 | 4
// ) {
//   call(slideCtx, `setBgColor${n}`, payload.bg?.color ?? "#fff");
//   call(slideCtx, `setBgImage${n}`, payload.bg?.image ?? "");
//   call(slideCtx, `setBgRect${n}`, payload.bg?.rect ?? null);

//   call(
//     slideCtx,
//     `setShowOneTextRightSideBox${n}`,
//     !!payload.flags?.showOneText
//   );
//   call(slideCtx, `setMultipleTextValue${n}`, !!payload.flags?.multipleText);

//   call(slideCtx, `setOneTextValue${n}`, payload.oneText?.value ?? "");
//   call(slideCtx, `setFontSize${n}`, payload.oneText?.fontSize);
//   call(slideCtx, `setFontWeight${n}`, payload.oneText?.fontWeight);
//   call(slideCtx, `setFontColor${n}`, payload.oneText?.fontColor);
//   call(slideCtx, `setFontFamily${n}`, payload.oneText?.fontFamily);
//   call(slideCtx, `setTextAlign${n}`, payload.oneText?.textAlign);
//   call(slideCtx, `setVerticalAlign${n}`, payload.oneText?.verticalAlign);
//   call(slideCtx, `setRotation${n}`, payload.oneText?.rotation ?? 0);
//   call(slideCtx, `setLineHeight${n}`, payload.oneText?.lineHeight);
//   call(slideCtx, `setLetterSpacing${n}`, payload.oneText?.letterSpacing);

//   call(
//     slideCtx,
//     `setTexts${n}`,
//     Array.isArray(payload.multipleTexts) ? payload.multipleTexts : []
//   );
//   call(
//     slideCtx,
//     `setTextElements${n}`,
//     Array.isArray(payload.user?.freeTexts) ? payload.user.freeTexts : []
//   );

//   const images = mergeBuckets(payload.user?.images);
//   call(slideCtx, `setDraggableImages${n}`, Array.isArray(images) ? images : []);

//   // ✅ If selection empty, auto-select all so UI renders content
//   const selected = payload.user?.selectedImageIds ?? [];
//   const selectedFinal =
//     Array.isArray(selected) && selected.length > 0
//       ? selected
//       : (images ?? []).map((i: any) => i.id);

//   call(slideCtx, `setSelectedImg${n}`, selectedFinal);

//   const stickers = mergeBuckets(payload.user?.stickers);
//   call(
//     slideCtx,
//     `setSelectedStickers${n}`,
//     Array.isArray(stickers) ? stickers : []
//   );

//   const bgFrames = mergeBuckets(payload.layout?.bgFrames);
//   const layoutStickers = mergeBuckets(payload.layout?.stickers);
//   const staticText = payload.layout?.staticText ?? [];
//   call(slideCtx, `setLayout${n}`, {
//     elements: bgFrames,
//     stickers: layoutStickers,
//     textElements: staticText,
//   });

//   call(slideCtx, `setSelectedVideoUrl${n}`, payload.qrVideo?.url ?? "");
//   call(slideCtx, `setQrPosition${n}`, {
//     x: payload.qrVideo?.x ?? slideCtx?.[`qrPosition${n}`]?.x,
//     y: payload.qrVideo?.y ?? slideCtx?.[`qrPosition${n}`]?.y,
//     width: payload.qrVideo?.width ?? slideCtx?.[`qrPosition${n}`]?.width,
//     height: payload.qrVideo?.height ?? slideCtx?.[`qrPosition${n}`]?.height,
//     zIndex: payload.qrVideo?.zIndex ?? slideCtx?.[`qrPosition${n}`]?.zIndex,
//     url: payload.qrVideo?.url ?? slideCtx?.[`qrPosition${n}`]?.url,
//   });

//   call(slideCtx, `setSelectedAudioUrl${n}`, payload.qrAudio?.url ?? "");
//   call(slideCtx, `setQrAudioPosition${n}`, {
//     x: payload.qrAudio?.x ?? slideCtx?.[`qrAudioPosition${n}`]?.x,
//     y: payload.qrAudio?.y ?? slideCtx?.[`qrAudioPosition${n}`]?.y,
//     width: payload.qrAudio?.width ?? slideCtx?.[`qrAudioPosition${n}`]?.width,
//     height:
//       payload.qrAudio?.height ?? slideCtx?.[`qrAudioPosition${n}`]?.height,
//     zIndex:
//       payload.qrAudio?.zIndex ?? slideCtx?.[`qrAudioPosition${n}`]?.zIndex,
//     url: payload.qrAudio?.url ?? slideCtx?.[`qrAudioPosition${n}`]?.url,
//   });

//   const aiEnabled = !!payload.flags?.isAIImage;
//   call(slideCtx, `setIsAIimage${n}`, aiEnabled);
//   call(slideCtx, `setSelectedAIimageUrl${n}`, payload.ai?.imageUrl ?? "");
//   call(
//     slideCtx,
//     `setAimage${n}`,
//     payload.ai
//       ? {
//           x: payload.ai.x,
//           y: payload.ai.y,
//           width: payload.ai.width,
//           height: payload.ai.height,
//         }
//       : null
//   );
// }

export function applyPolygonLayoutToContexts(
  polygonlayout: any,
  slide1: any,
  slide2: any,
  slide3: any,
  slide4: any,
  opts?: { normalizeLayout?: boolean }
) {
  if (!polygonlayout) return;

  if (isV2Layout(polygonlayout)) {
    applySlideV2ToContext(polygonlayout.slides.slide1, slide1, 1, opts);
    applySlideV2ToContext(polygonlayout.slides.slide2, slide2, 2, opts);
    applySlideV2ToContext(polygonlayout.slides.slide3, slide3, 3, opts);
    applySlideV2ToContext(polygonlayout.slides.slide4, slide4, 4, opts);
    return;
  }

  // Old layout fallback (keep your legacy logic here if needed)
  const s1 = polygonlayout?.slide1 ?? polygonlayout?.s1 ?? null;
  const s2 = polygonlayout?.slide2 ?? polygonlayout?.s2 ?? null;
  const s3 = polygonlayout?.slide3 ?? polygonlayout?.s3 ?? null;
  const s4 = polygonlayout?.slide4 ?? polygonlayout?.s4 ?? null;

  if (s1) {
    slide1?.setBgColor1?.(s1.bgColor1 ?? "#fff");
    slide1?.setBgImage1?.(s1.bgImage1 ?? "");
    slide1?.setBgRect1?.(s1.bgRect1 ?? null);
    slide1?.setTextElements1?.(
      Array.isArray(s1.textElements1) ? s1.textElements1 : []
    );
    slide1?.setDraggableImages1?.(
      Array.isArray(s1.draggableImages1) ? s1.draggableImages1 : []
    );
    slide1?.setSelectedStickers1?.(
      Array.isArray(s1.selectedStickers1) ? s1.selectedStickers1 : []
    );
    slide1?.setSelectedVideoUrl1?.(s1.selectedVideoUrl1 ?? "");
    slide1?.setSelectedAudioUrl1?.(s1.selectedAudioUrl1 ?? "");
    slide1?.setQrPosition1?.(s1.qrPosition1 ?? slide1.qrPosition1);
    slide1?.setQrAudioPosition1?.(
      s1.qrAudioPosition1 ?? slide1.qrAudioPosition1
    );
    slide1?.setIsAIimage1?.(!!s1.isAIimage1);
    slide1?.setSelectedAIimageUrl1?.(s1.selectedAIimageUrl1 ?? "");
    slide1?.setAimage1?.(s1.aimage1 ?? null);
  }

  if (s2) slide2?.hydrateFromLayout?.(s2);
  if (s3) slide3?.hydrateFromLayout?.(s3);
  if (s4) slide4?.hydrateFromLayout?.(s4);
}

// src/lib/polygon.ts

export function hasAnyDesignV2(layout: any): boolean {
  if (!layout || layout.version !== 2 || !layout.slides) return false;

  const slides: SlidePayloadV2[] = [
    layout.slides.slide1,
    layout.slides.slide2,
    layout.slides.slide3,
    layout.slides.slide4,
  ].filter(Boolean);

  const hasSlideContent = (s: SlidePayloadV2) => {
    const bgFrames = mergeBuckets(s.layout?.bgFrames);
    const layoutStickers = mergeBuckets(s.layout?.stickers);
    const userImages = mergeBuckets(s.user?.images);
    const userStickers = mergeBuckets(s.user?.stickers);

    const hasBg = !!s.bg?.image || (!!s.bg?.color && s.bg.color !== "#fff");
    const hasOneText = !!s.oneText?.value?.trim();
    const hasMultipleTexts = (s.multipleTexts?.length ?? 0) > 0;
    const hasStaticText = (s.layout?.staticText?.length ?? 0) > 0;

    const hasFrames = bgFrames.length > 0;
    const hasLayoutStickers2 = layoutStickers.length > 0;

    const hasImages = userImages.length > 0;
    const hasStickers = userStickers.length > 0;
    const hasFreeTexts = (s.user?.freeTexts?.length ?? 0) > 0;

    const hasQr = !!s.qrVideo?.url || !!s.qrAudio?.url;
    const hasAi = !!s.ai?.imageUrl;

    return (
      hasBg ||
      hasOneText ||
      hasMultipleTexts ||
      hasStaticText ||
      hasFrames ||
      hasLayoutStickers2 ||
      hasImages ||
      hasStickers ||
      hasFreeTexts ||
      hasQr ||
      hasAi
    );
  };

  return slides.some(hasSlideContent);
}
/**
+ * "Meaningful" for v2 means it actually contains design content.
+ * This prevents empty `{version:2, slides:{...}}` from overwriting real designs.
+ */
export const isMeaningfulPolygonLayout = (layout: any): boolean => {
  if (!layout) return false;
  if (isV2Layout(layout)) return hasAnyDesignV2(layout);
  if (Array.isArray(layout)) return layout.length > 0;
  if (typeof layout !== "object") return false;
  return Object.keys(layout).length > 0;
};

const normalizeLayoutCandidate = (layout: any) => {
  if (typeof layout !== "string") return layout;
  try {
    const parsed = JSON.parse(layout);
    return parsed ?? layout;
  } catch {
    return layout;
  }
};

export const pickPolygonLayout = (...candidates: any[]) =>
  candidates.map(normalizeLayoutCandidate).find(isMeaningfulPolygonLayout) ?? null;

const suffixFor = (n: 1 | 2 | 3 | 4) => (n === 2 ? "" : String(n));
const fnName = (base: string, n: 1 | 2 | 3 | 4) => `${base}${suffixFor(n)}`;

const getCtxProp = (ctx: any, base: string, n: 1 | 2 | 3 | 4) =>
  ctx?.[`${base}${suffixFor(n)}`] ??
  ctx?.[base] ??
  (n === 2 ? ctx?.[`${base}2`] : undefined);

function applySlideV2ToContext(
  payload: SlidePayloadV2,
  slideCtx: any,
  n: 1 | 2 | 3 | 4,
  opts?: { normalizeLayout?: boolean }
) {
  const callFn = (base: string, ...args: any[]) => {
    const name = fnName(base, n);
    if (typeof slideCtx?.[name] === "function") {
      slideCtx[name](...args);
      return;
    }
    if (n === 2) {
      const alt = `${base}2`;
      if (typeof slideCtx?.[alt] === "function") {
        slideCtx[alt](...args);
      }
    }
  };
  const callFnAlt = (bases: string[], ...args: any[]) => {
    for (const b of bases) {
      const name = n === 2 ? b : `${b}${n}`;
      if (typeof slideCtx?.[name] === "function") {
        slideCtx[name](...args);
        return;
      }
    }
  };

  // BG
  callFn("setBgColor", payload.bg?.color ?? "#fff");
  callFn("setBgImage", payload.bg?.image ?? "");
  callFn("setBgRect", payload.bg?.rect ?? null);
  callFn("setBgLocked", !!payload.bg?.locked);

  // Flags
  callFn("setShowOneTextRightSideBox", !!payload.flags?.showOneText);
  callFn("setMultipleTextValue", !!payload.flags?.multipleText);

  // OneText
  callFn("setOneTextValue", payload.oneText?.value ?? "");
  callFn("setFontSize", payload.oneText?.fontSize);
  callFn("setFontWeight", payload.oneText?.fontWeight);
  callFn("setFontColor", payload.oneText?.fontColor);
  callFn("setFontFamily", payload.oneText?.fontFamily);
  callFn("setTextAlign", payload.oneText?.textAlign);
  callFn("setVerticalAlign", payload.oneText?.verticalAlign);
  callFn("setRotation", payload.oneText?.rotation ?? 0);
  callFn("setLineHeight", payload.oneText?.lineHeight);
  callFn("setLetterSpacing", payload.oneText?.letterSpacing);

  // Multi texts + free texts
  callFn(
    "setTexts",
    Array.isArray(payload.multipleTexts) ? payload.multipleTexts : []
  );
  callFn(
    "setTextElements",
    Array.isArray(payload.user?.freeTexts) ? payload.user.freeTexts : []
  );

  // Images
  const images = mergeBuckets(payload.user?.images);
  callFn("setDraggableImages", Array.isArray(images) ? images : []);

  // ✅ Selection (THIS is why images weren't showing)
  const selected = payload.user?.selectedImageIds ?? [];
  const selectedFinal =
    Array.isArray(selected) && selected.length > 0
      ? selected
      : (images ?? []).map((i: any) => i.id);

  // contexts naming:
  // slide1: setSelectedImage1
  // slide2: setSelectedImage
  // slide3: setSelectedImage3
  // slide4: setSelectedImage4
  callFnAlt(["setSelectedImage"], selectedFinal);
  callFnAlt(["setSelectedImg"], selectedFinal); // keep if any old ctx has this

  // Stickers
  const stickers = mergeBuckets(payload.user?.stickers);
  callFn("setSelectedStickers", Array.isArray(stickers) ? stickers : []);

  // Layout frames + layout stickers + static text (or full merged layout for user view)
  const layout = opts?.normalizeLayout
    ? normalizeSlideToLayout(payload)
    : {
        elements: mergeBuckets(payload.layout?.bgFrames),
        stickers: mergeBuckets(payload.layout?.stickers),
        textElements: payload.layout?.staticText ?? [],
      };
  callFn("setLayout", layout);

  // QR Video
  callFnAlt(["setSelectedVideoUrl"], payload.qrVideo?.url ?? null);
  const qrPosPrev = getCtxProp(slideCtx, "qrPosition", n) ?? {};
  callFnAlt(["setQrPosition"], {
    x: payload.qrVideo?.x ?? qrPosPrev?.x,
    y: payload.qrVideo?.y ?? qrPosPrev?.y,
    width: payload.qrVideo?.width ?? qrPosPrev?.width,
    height: payload.qrVideo?.height ?? qrPosPrev?.height,
    zIndex: payload.qrVideo?.zIndex ?? qrPosPrev?.zIndex,
    url: payload.qrVideo?.url ?? qrPosPrev?.url,
  });

  // QR Audio
  callFnAlt(["setSelectedAudioUrl"], payload.qrAudio?.url ?? null);
  const qrAudioPrev = getCtxProp(slideCtx, "qrAudioPosition", n) ?? {};
  callFnAlt(["setQrAudioPosition"], {
    x: payload.qrAudio?.x ?? qrAudioPrev?.x,
    y: payload.qrAudio?.y ?? qrAudioPrev?.y,
    width: payload.qrAudio?.width ?? qrAudioPrev?.width,
    height: payload.qrAudio?.height ?? qrAudioPrev?.height,
    zIndex: payload.qrAudio?.zIndex ?? qrAudioPrev?.zIndex,
    url: payload.qrAudio?.url ?? qrAudioPrev?.url,
  });

  // AI
  const aiEnabled = !!payload.flags?.isAIImage;
  callFn("setIsAIimage", aiEnabled);
  callFn("setSelectedAIimageUrl", payload.ai?.imageUrl ?? "");
  callFn(
    "setAimage",
    payload.ai
      ? {
          x: payload.ai.x,
          y: payload.ai.y,
          width: payload.ai.width,
          height: payload.ai.height,
        }
      : null
  );
}

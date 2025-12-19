// utils/polygon.ts
import * as htmlToImage from "html-to-image";

/* ----------------------------- Shared helpers ---------------------------- */

const pick = <T = any>(o: any, keys: string[], d?: any): T =>
  (keys.find(k => o && o[k] !== undefined)
    ? (o[keys.find(k => o[k] !== undefined)!] as T)
    : d) as T;

const splitBucket = <T extends { locked?: boolean }>(arr: T[] = []) => ({
  editable: arr.filter(i => !i.locked),
  locked:   arr.filter(i =>  i.locked),
});

/* --------------------------------- Types --------------------------------- */

// Re-usable bucket type
export type Bucket<T> = {
  editable: T[];
  locked: T[];
};

// Layout (template) background frame
export type BgFrame = {
  id: string;
  x: number; y: number; width: number; height: number;
  src: string;
  zIndex?: number;
  rotation?: number;
  locked?: boolean;
};

// User image on canvas
export type UserImage = {
  id: string;
  src: string;
  x: number; y: number; width: number; height: number;
  rotation?: number; zIndex?: number;
  filter?: string; shapePath?: string;
  locked?: boolean;
};

// Sticker (layout or user)
export type Sticker = {
  id?: string;
  sticker: string;
  x: number; y: number; width: number; height: number;
  rotation?: number; zIndex?: number;
  locked?: boolean;
};

// Free text (admin/user layer)
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

// Static text in a template layout (non-RND)
export type StaticText = {
  id?: string;
  text: string;
  x: number; y: number; width: number; height: number;
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
  x?: number; y?: number; width?: number; height?: number; zIndex?: number;
  url?: string | null;
};

export type AIImage = {
  x?: number; y?: number; width?: number; height?: number;
  imageUrl?: string | null;
};

/* -------------------------- Slide payload (v2) --------------------------- */

export type SlidePayloadV2 = {
  // simple meta for background + toggles
  bg: { color?: string | null; image?: string | null };
  flags: {
    showOneText?: boolean;
    multipleText?: boolean;
    isAIImage?: boolean;
  };

  // one-text layout styling (optional)
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

  // multi-text layout slices (your original `texts1` etc.)
  multipleTexts?: Array<any>;

  // layout/template layer (non-RND background frames + static stickers/text)
  layout: {
    bgFrames: Bucket<BgFrame>;
    stickers: Bucket<Sticker>;
    staticText: StaticText[];
  };

  // user/admin editable layer
  user: {
    images: Bucket<UserImage>;
    stickers: Bucket<Sticker>;
    freeTexts: FreeText[];
  };

  // media (QR)
  qrVideo?: QRBox | null;
  qrAudio?: QRBox | null;

  // AI image box
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

/* ------------------------------ Normalizer ------------------------------ */

const normalizeSlideV2 = (ctx: any): SlidePayloadV2 => {
  // background
  const bg = {
    color: pick<string>(ctx, ["bgColor1","bgColor2","bgColor3","bgColor4","bgColor"], null),
    image: pick<string>(ctx, ["bgImage1","bgImage2","bgImage3","bgImage4","bgImage"], null),
  };

  // flags
  const flags = {
    showOneText: !!pick(ctx, [
      "showOneTextRightSideBox1","showOneTextRightSideBox2",
      "showOneTextRightSideBox3","showOneTextRightSideBox4","showOneTextRightSideBox"
    ], false),
    multipleText: !!pick(ctx, [
      "multipleTextValue1","multipleTextValue2","multipleTextValue3","multipleTextValue4","multipleTextValue"
    ], false),
    isAIImage: !!pick(ctx, ["isAIimage1","isAIimage2","isAIimage3","isAIimage4","isAIimage"], false),
  };

  // one-text style block
  const oneText = {
    value: pick<string>(ctx, ["oneTextValue1","oneTextValue2","oneTextValue3","oneTextValue4","oneTextValue"], ""),
    fontSize: pick<number>(ctx, ["fontSize1","fontSize2","fontSize3","fontSize4","fontSize"]),
    fontWeight: pick(ctx, ["fontWeight1","fontWeight2","fontWeight3","fontWeight4","fontWeight"]),
    fontColor: pick<string>(ctx, ["fontColor1","fontColor2","fontColor3","fontColor4","fontColor"]),
    fontFamily: pick<string>(ctx, ["fontFamily1","fontFamily2","fontFamily3","fontFamily4","fontFamily"]),
    textAlign: pick(ctx, ["textAlign1","textAlign2","textAlign3","textAlign4","textAlign"]),
    verticalAlign: pick(ctx, ["verticalAlign1","verticalAlign2","verticalAlign3","verticalAlign4","verticalAlign"]),
    rotation: pick<number>(ctx, ["rotation1","rotation2","rotation3","rotation4","rotation"], 0),
    lineHeight: pick<number>(ctx, ["lineHeight1","lineHeight2","lineHeight3","lineHeight4","lineHeight"]),
    letterSpacing: pick(ctx, ["letterSpacing1","letterSpacing2","letterSpacing3","letterSpacing4","letterSpacing"]),
  };

  // multi-text slices (keep as-is)
  const multipleTexts = pick<any[]>(ctx, ["texts1","texts2","texts3","texts4","texts"], [])?.map(t => ({ ...t }));

  // --------------------- layout/template level (bg, stickers, text) ---------------------
  const layoutRaw = pick<any>(ctx, ["layout1","layout2","layout3","layout4","layout"], null);

  const layoutBgFramesAll: BgFrame[] = (layoutRaw?.elements ?? []).map((el: any) => ({
    id: el.id,
    x: el.x, y: el.y, width: el.width, height: el.height,
    src: el.src,
    zIndex: el.zIndex,
    rotation: el.rotation,
    locked: !!el.locked,
  }));

  const layoutStickersAll: Sticker[] = (layoutRaw?.stickers ?? []).map((st: any) => ({
    id: st.id,
    sticker: st.sticker,
    x: st.x, y: st.y, width: st.width, height: st.height,
    rotation: st.rotation,
    zIndex: st.zIndex,
    locked: !!st.locked,
  }));

  const staticText: StaticText[] = (layoutRaw?.textElements ?? []).map((te: any) => ({
    id: te.id,
    text: te.text,
    x: te.x, y: te.y, width: te.width, height: te.height,
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
  }));

  // split into buckets
  const layout = {
    bgFrames: splitBucket<BgFrame>(layoutBgFramesAll),
    stickers: splitBucket<Sticker>(layoutStickersAll),
    staticText,
  };

  // ------------------------- user/admin editable layer -------------------------
  const selectedImg = pick<string[]>(
    ctx,
    ["selectedImg1","selectedImg2","selectedImg3","selectedImg4","selectedImg"],
    []
  );

  const imagesRaw = pick<any[]>(
    ctx,
    ["draggableImages1","draggableImages2","draggableImages3","draggableImages4","draggableImages"],
    []
  );

  const userImagesAll: UserImage[] = imagesRaw
    ?.filter((img: any) => (Array.isArray(selectedImg) ? selectedImg.includes(img.id) : true))
    .map((img: any) => ({
      id: img.id,
      src: img.src,
      x: img.x, y: img.y, width: img.width, height: img.height,
      rotation: img.rotation,
      zIndex: img.zIndex,
      filter: img.filter,
      shapePath: img.shapePath,
      locked: !!img.locked,
    }));

  const userStickersAll: Sticker[] = pick<any[]>(
    ctx,
    ["selectedStickers1","selectedStickers2","selectedStickers3","selectedStickers4","selectedStickers"],
    []
  )?.map(st => ({
    id: st.id,
    sticker: st.sticker,
    x: st.x, y: st.y, width: st.width, height: st.height,
    zIndex: st.zIndex,
    rotation: st.rotation,
    locked: !!st.locked,
  }));

  const freeTexts: FreeText[] = pick<any[]>(
    ctx,
    ["textElements1","textElements2","textElements3","textElements4","textElements"],
    []
  )?.map(t => ({
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

  const user = {
    images: splitBucket<UserImage>(userImagesAll),
    stickers: splitBucket<Sticker>(userStickersAll),
    freeTexts,
  };

  // ------------------------------- media / QR -------------------------------
  const selectedVideoUrl = pick<string | null>(
    ctx, ["selectedVideoUrl1","selectedVideoUrl2","selectedVideoUrl3","selectedVideoUrl4","selectedVideoUrl"], null
  );
  const qrPos = pick<any>(ctx, ["qrPosition1","qrPosition2","qrPosition3","qrPosition4","qrPosition"], {});
  const qrVideo = selectedVideoUrl ? ({
    url: selectedVideoUrl,
    x: qrPos?.x, y: qrPos?.y, width: qrPos?.width, height: qrPos?.height, zIndex: qrPos?.zIndex,
  } as QRBox) : null;

  const selectedAudioUrl = pick<string | null>(
    ctx, ["selectedAudioUrl1","selectedAudioUrl2","selectedAudioUrl3","selectedAudioUrl4","selectedAudioUrl"], null
  );
  const qrAudioPos = pick<any>(ctx, ["qrAudioPosition1","qrAudioPosition2","qrAudioPosition3","qrAudioPosition4","qrAudioPosition"], {});
  const qrAudio = selectedAudioUrl ? ({
    url: selectedAudioUrl,
    x: qrAudioPos?.x, y: qrAudioPos?.y, width: qrAudioPos?.width, height: qrAudioPos?.height, zIndex: qrAudioPos?.zIndex,
  } as QRBox) : null;

  // ------------------------------- AI image --------------------------------
  const aiEnabled = !!flags.isAIImage;
  const aimage = pick<any>(ctx, ["aimage1","aimage2","aimage3","aimage4","aimage"], null);
  const selectedAIimageUrl = pick<string>(
    ctx, ["selectedAIimageUrl1","selectedAIimageUrl2","selectedAIimageUrl3","selectedAIimageUrl4","selectedAIimageUrl"], null
  );
  const ai: AIImage | null = aiEnabled
    ? { x: aimage?.x, y: aimage?.y, width: aimage?.width, height: aimage?.height, imageUrl: selectedAIimageUrl }
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

export type PolygonLayout = PolygonLayoutV2; // alias for current

export const buildPolygonLayout = (s1: any, s2: any, s3: any, s4: any): PolygonLayoutV2 => ({
  version: 2 as const,
  slides: {
    slide1: normalizeSlideV2(s1),
    slide2: normalizeSlideV2(s2),
    slide3: normalizeSlideV2(s3),
    slide4: normalizeSlideV2(s4),
  },
});

/* ----------------------------- Capture helper ----------------------------- */

export async function captureNodeToPng(node: HTMLElement, bg?: string): Promise<string> {
  return htmlToImage.toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: bg ?? getComputedStyle(node).backgroundColor ?? "#ffffff",
  });
}

/* -------------------------- Optional: merge helper ------------------------- */
/** When hydrating the editor, this helps you merge editable+locked quickly. */
export const mergeBuckets = <T>(b?: Bucket<T>) =>
  b ? [ ...(b.editable || []), ...(b.locked || []) ] : [];

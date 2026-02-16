export type SlidesPayload = Record<string, string>;

type TwoUpOptions = {
  gapPx?: number;
  dpi?: number;
  background?: string;
  quality?: number;
  orientation?: "portrait" | "landscape";
  fit?: "contain" | "cover";
  pairStrategy?: "sequential" | "outer-inner";
  pageMm?: { w: number; h: number };
  pageTitle?: (args: {
    pageIndex: number;
    leftKey?: string;
    rightKey?: string;
  }) => string | null | undefined;
  titleStyle?: {
    font?: string;
    color?: string;
    background?: string;
    paddingX?: number;
    paddingY?: number;
    radius?: number;
    align?: "left" | "center" | "right";
    offsetX?: number;
    offsetY?: number;
  };
};

type TenUpOptions = TwoUpOptions & {
  columns?: number;
  rows?: number;
  marginPx?: number;
};

const A4_PORTRAIT_MM = { w: 210, h: 297 };
const A3_PORTRAIT_MM = { w: 297, h: 420 };
const A5_PORTRAIT_MM = { w: 148, h: 210 };
const US_LETTER_MM = { w: 215.9, h: 279.4 };
const HALF_US_LETTER_MM = { w: 139.7, h: 215.9 };
const US_TABLOID_MM = { w: 279.4, h: 431.8 };
const mmToPx = (mm: number, dpi: number) => Math.round((mm / 25.4) * dpi);

const defaultOptions: Required<TwoUpOptions> = {
  gapPx: 10,
  dpi: 300,
  background: "#ffffff",
  quality: 0.92,
  orientation: "landscape",
  fit: "contain",
  pairStrategy: "sequential",
  pageMm: A4_PORTRAIT_MM,
  pageTitle: () => undefined,
  titleStyle: {
    font: "22px Arial",
    color: "#111111",
    background: "rgba(255,255,255,0.75)",
    paddingX: 8,
    paddingY: 6,
    radius: 4,
    align: "left",
    offsetX: 12,
    offsetY: 12,
  },
};

const getSlideOrder = (key: string) => {
  const match = key.match(/(\d+)/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number.parseInt(match[1], 10);
};

const sortSlideKeys = (keys: string[]) =>
  [...keys].sort((a, b) => {
    const na = getSlideOrder(a);
    const nb = getSlideOrder(b);
    if (na !== nb) return na - nb;
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });

const applyPairStrategy = (
  keys: string[],
  strategy: "sequential" | "outer-inner",
) => {
  if (strategy !== "outer-inner") return keys;
  const out: string[] = [];
  let i = 0;
  let j = keys.length - 1;
  while (i <= j) {
    if (i === j) {
      out.push(keys[i]);
      break;
    }
    out.push(keys[i], keys[j]);
    i += 1;
    j -= 1;
  }
  return out;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });

export const isCardsCategory = (name?: string) => {
  const n = String(name ?? "").trim().toLowerCase();
  return n === "cards" || n.includes("card");
};

export const isBusinessCardsCategory = (name?: string) =>
  /business\s*cards?/i.test(String(name ?? ""));

export const isA4Size = (size?: string) =>
  String(size ?? "").trim().toLowerCase() === "a4";

export const isBusinessCardPrintSize = (size?: string) => {
  const s = String(size ?? "").trim().toLowerCase();
  return (
    s === "a5" ||
    s === "a4" ||
    s === "a3" ||
    s === "us_letter" ||
    s === "half_us_letter" ||
    s === "us_tabloid"
  );
};

export const isParallelCardSize = (size?: string) => {
  const s = String(size ?? "").trim().toLowerCase();
  return (
    s === "a5" ||
    s === "a4" ||
    s === "a3" ||
    s === "us_letter" ||
    s === "half_us_letter" ||
    s === "us_tabloid"
  );
};

export const getPageMmForSize = (size?: string) => {
  const s = String(size ?? "").trim().toLowerCase();
  if (s === "a3") return A3_PORTRAIT_MM;
  if (s === "a5") return A5_PORTRAIT_MM;
  if (s === "us_letter") return US_LETTER_MM;
  if (s === "half_us_letter") return HALF_US_LETTER_MM;
  if (s === "us_tabloid") return US_TABLOID_MM;
  return A4_PORTRAIT_MM;
};

export async function buildTwoUpSlides(
  slides: SlidesPayload,
  options?: TwoUpOptions,
): Promise<SlidesPayload> {
  const opts = {
    ...defaultOptions,
    ...(options ?? {}),
    titleStyle: { ...defaultOptions.titleStyle, ...(options?.titleStyle ?? {}) },
  };
  const keys = applyPairStrategy(
    sortSlideKeys(Object.keys(slides).filter((k) => slides[k])),
    opts.pairStrategy,
  );

  if (keys.length === 0) return {};

  const baseMm = opts.pageMm ?? A4_PORTRAIT_MM;
  const pageMm =
    opts.orientation === "landscape"
      ? { w: baseMm.h, h: baseMm.w }
      : baseMm;
  const pageWidth = mmToPx(pageMm.w, opts.dpi);
  const pageHeight = mmToPx(pageMm.h, opts.dpi);

  const output: SlidesPayload = {};
  let pageIndex = 1;

  for (let i = 0; i < keys.length; i += 2) {
    const leftKey = keys[i];
    const rightKey = keys[i + 1];

    const leftSrc = slides[leftKey];
    if (!leftSrc) continue;

    const [leftImg, rightImg] = await Promise.all([
      loadImage(leftSrc),
      rightKey && slides[rightKey] ? loadImage(slides[rightKey]) : Promise.resolve(null),
    ]);

    const canvas = document.createElement("canvas");
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, pageWidth, pageHeight);

    const slotWidth = (pageWidth - opts.gapPx) / 2;
    const slotHeight = pageHeight;

    const drawInSlot = (img: HTMLImageElement, slotX: number) => {
      const scale =
        opts.fit === "cover"
          ? Math.max(slotWidth / img.width, slotHeight / img.height)
          : Math.min(slotWidth / img.width, slotHeight / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = slotX + (slotWidth - drawW) / 2;
      const offsetY = (slotHeight - drawH) / 2;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    drawInSlot(leftImg, 0);
    if (rightImg) drawInSlot(rightImg, slotWidth + opts.gapPx);

    const title = opts.pageTitle?.({
      pageIndex,
      leftKey,
      rightKey,
    });
    if (title) {
      const style = opts.titleStyle;
      const font = style.font ?? "22px Arial";
      const paddingX = style.paddingX ?? 8;
      const paddingY = style.paddingY ?? 6;
      const offsetX = style.offsetX ?? 12;
      const offsetY = style.offsetY ?? 12;
      const align = style.align ?? "left";

      ctx.save();
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = style.color ?? "#111111";

      const metrics = ctx.measureText(title);
      const textW = metrics.width;
      const textH = Math.ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
      const boxW = textW + paddingX * 2;
      const boxH = textH + paddingY * 2;

      let x = offsetX;
      if (align === "center") x = (pageWidth - boxW) / 2 + offsetX;
      if (align === "right") x = pageWidth - boxW - offsetX;
      const y = offsetY;

      if (style.background) {
        ctx.fillStyle = style.background;
        const r = Math.max(0, style.radius ?? 0);
        if (r > 0) {
          const right = x + boxW;
          const bottom = y + boxH;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(right - r, y);
          ctx.quadraticCurveTo(right, y, right, y + r);
          ctx.lineTo(right, bottom - r);
          ctx.quadraticCurveTo(right, bottom, right - r, bottom);
          ctx.lineTo(x + r, bottom);
          ctx.quadraticCurveTo(x, bottom, x, bottom - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(x, y, boxW, boxH);
        }
      }

      ctx.fillStyle = style.color ?? "#111111";
      ctx.fillText(title, x + paddingX, y + paddingY);
      ctx.restore();
    }

    output[`slide${pageIndex}`] = canvas.toDataURL("image/jpeg", opts.quality);
    pageIndex += 1;
  }

  return output;
}

export async function buildTenUpSlides(
  slides: SlidesPayload,
  options?: TenUpOptions,
): Promise<SlidesPayload> {
  const opts: Required<TenUpOptions> = {
    ...defaultOptions,
    orientation: "portrait",
    columns: 2,
    rows: 5,
    marginPx: 12,
    ...(options ?? {}),
    titleStyle: { ...defaultOptions.titleStyle, ...(options?.titleStyle ?? {}) },
  };

  const keys = sortSlideKeys(Object.keys(slides).filter((k) => slides[k]));
  if (keys.length === 0) return {};

  const baseMm = opts.pageMm ?? A4_PORTRAIT_MM;
  const pageMm =
    opts.orientation === "landscape"
      ? { w: baseMm.h, h: baseMm.w }
      : baseMm;
  const pageWidth = mmToPx(pageMm.w, opts.dpi);
  const pageHeight = mmToPx(pageMm.h, opts.dpi);

  const cols = Math.max(1, Math.floor(opts.columns));
  const rows = Math.max(1, Math.floor(opts.rows));
  const margin = Math.max(0, opts.marginPx);
  const gapX = Math.max(0, opts.gapPx);
  const gapY = Math.max(0, opts.gapPx);

  const slotWidth = (pageWidth - margin * 2 - gapX * (cols - 1)) / cols;
  const slotHeight = (pageHeight - margin * 2 - gapY * (rows - 1)) / rows;

  const output: SlidesPayload = {};
  let pageIndex = 1;

  for (const key of keys) {
    const src = slides[key];
    if (!src) continue;

    const img = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    ctx.fillStyle = opts.background;
    ctx.fillRect(0, 0, pageWidth, pageHeight);

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const slotX = margin + c * (slotWidth + gapX);
        const slotY = margin + r * (slotHeight + gapY);
        const scale =
          opts.fit === "cover"
            ? Math.max(slotWidth / img.width, slotHeight / img.height)
            : Math.min(slotWidth / img.width, slotHeight / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const offsetX = slotX + (slotWidth - drawW) / 2;
        const offsetY = slotY + (slotHeight - drawH) / 2;
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      }
    }

    output[`slide${pageIndex}`] = canvas.toDataURL("image/jpeg", opts.quality);
    pageIndex += 1;
  }

  return output;
}

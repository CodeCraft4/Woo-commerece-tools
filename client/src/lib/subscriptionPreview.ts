const SUBSCRIPTION_PREVIEW_STORAGE_KEY = "subscription_preview_payload";
const SUBSCRIPTION_PREVIEW_LOCAL_STORAGE_KEY = "subscription_preview_payload_local";

export type SubscriptionPreviewSlides = Record<string, string>;

type PersistedSubscriptionPreview = {
  previewKey?: string;
  slides: SubscriptionPreviewSlides;
};

const getValidSlides = (slides?: Record<string, unknown> | null): SubscriptionPreviewSlides =>
  Object.fromEntries(
    Object.entries(slides ?? {}).filter(
      ([, value]) => typeof value === "string" && value.startsWith("data:image/"),
    ),
  ) as SubscriptionPreviewSlides;

export const saveSubscriptionPreviewPayload = (
  slides?: Record<string, unknown> | null,
  previewKey?: string | null,
) => {
  const validSlides = getValidSlides(slides);
  if (!Object.keys(validSlides).length) return;

  const payload: PersistedSubscriptionPreview = {
    slides: validSlides,
    ...(previewKey ? { previewKey } : {}),
  };

  try {
    sessionStorage.setItem(SUBSCRIPTION_PREVIEW_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
  try {
    localStorage.setItem(SUBSCRIPTION_PREVIEW_LOCAL_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
};

export const readSubscriptionPreviewPayload = (expectedPreviewKey?: string | null): SubscriptionPreviewSlides => {
  const tryParse = (raw: string | null) => {
    if (!raw) return {} as SubscriptionPreviewSlides;
    try {
      const parsed = JSON.parse(raw) as PersistedSubscriptionPreview | null;
      const validSlides = getValidSlides(parsed?.slides);
      if (!Object.keys(validSlides).length) return {} as SubscriptionPreviewSlides;

      const storedPreviewKey = String(parsed?.previewKey ?? "").trim();
      const nextPreviewKey = String(expectedPreviewKey ?? "").trim();
      if (storedPreviewKey && nextPreviewKey && storedPreviewKey !== nextPreviewKey) {
        return {} as SubscriptionPreviewSlides;
      }

      return validSlides;
    } catch {
      return {} as SubscriptionPreviewSlides;
    }
  };

  try {
    const fromSession = tryParse(sessionStorage.getItem(SUBSCRIPTION_PREVIEW_STORAGE_KEY));
    if (Object.keys(fromSession).length) return fromSession;
  } catch {}

  try {
    const fromLocal = tryParse(localStorage.getItem(SUBSCRIPTION_PREVIEW_LOCAL_STORAGE_KEY));
    if (Object.keys(fromLocal).length) return fromLocal;
  } catch {
    return {};
  }

  return {};
};

export const clearSubscriptionPreviewPayload = () => {
  try {
    sessionStorage.removeItem(SUBSCRIPTION_PREVIEW_STORAGE_KEY);
  } catch {}
  try {
    localStorage.removeItem(SUBSCRIPTION_PREVIEW_LOCAL_STORAGE_KEY);
  } catch {}
};

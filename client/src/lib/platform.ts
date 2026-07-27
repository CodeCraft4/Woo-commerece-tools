export const isIosTouchDevice = () => {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  return /iPad|iPhone|iPod/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
};

/**
 * All iOS browsers use WebKit, while desktop Safari is the only mainstream
 * desktop browser exposing Safari + AppleWebKit without a Chromium/Firefox
 * token. Keep this separate from touch/iOS checks so Safari-specific image
 * capture workarounds also run on macOS.
 */
export const isWebKitBrowser = () => {
  if (typeof navigator === "undefined") return false;
  if (isIosTouchDevice()) return true;

  const ua = navigator.userAgent || "";
  const hasWebKit = /AppleWebKit/i.test(ua);
  const hasSafari = /Safari/i.test(ua);
  const isOtherEngine =
    /Chrome|Chromium|CriOS|Edg|EdgiOS|OPR|FxiOS|Firefox|Android/i.test(ua);

  return hasWebKit && hasSafari && !isOtherEngine;
};

export const getIosMajorVersion = () => {
  if (typeof navigator === "undefined") return null;

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const osMatch = ua.match(/(?:CPU(?: iPhone)? OS|iPhone OS|CPU OS|OS)\s+(\d+)[_.]/i);

  if (osMatch?.[1]) {
    const major = Number(osMatch[1]);
    return Number.isFinite(major) ? major : null;
  }

  if (platform === "MacIntel" && maxTouchPoints > 1) {
    const safariVersionMatch = ua.match(/Version\/(\d+)(?:\.\d+)?(?:\.\d+)?\s+Mobile\/.*Safari/i);
    if (safariVersionMatch?.[1]) {
      const major = Number(safariVersionMatch[1]);
      return Number.isFinite(major) ? major : null;
    }
  }

  return null;
};

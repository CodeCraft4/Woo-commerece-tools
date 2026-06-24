export const isIosTouchDevice = () => {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  return /iPad|iPhone|iPod/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
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

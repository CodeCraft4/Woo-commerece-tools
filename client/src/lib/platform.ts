export const isIosTouchDevice = () => {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;

  return /iPad|iPhone|iPod/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
};

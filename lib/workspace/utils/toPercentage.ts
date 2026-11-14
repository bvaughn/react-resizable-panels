// Percentages are numbers, or strings without other units (e.g. "30%" or "30"); other units (e.g. "200px") are undefined
export function toPercentage(size: number | string): number | undefined {
  if (typeof size === "number") {
    return Number.isFinite(size) ? Math.max(0, Math.min(100, size)) : undefined;
  }

  const trimmed = size.trim();
  if (/^\d*\.?\d+%?$/.test(trimmed)) {
    return Math.max(0, Math.min(100, parseFloat(trimmed)));
  }

  return undefined;
}

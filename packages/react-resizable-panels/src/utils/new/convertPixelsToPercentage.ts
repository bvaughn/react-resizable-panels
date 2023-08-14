export function convertPixelsToPercentage(
  pixels: number,
  groupSizePixels: number
): number {
  return (pixels / groupSizePixels) * 100;
}

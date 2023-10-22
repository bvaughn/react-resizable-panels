export function convertPercentageToPixels(
  percentage: number,
  groupSizePixels: number
): number {
  return (percentage / 100) * groupSizePixels;
}

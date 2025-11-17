export function convertVwToPixels(value: number) {
  return (value / 100) * window.innerWidth;
}

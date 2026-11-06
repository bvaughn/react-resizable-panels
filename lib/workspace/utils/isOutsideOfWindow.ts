// Whether a point (in client coordinates) is outside of the window's viewport, e.g. a captured pointer dragged past the edge of the window;
// points over the window's scrollbars are within it
export function isOutsideOfWindow(
  ownerWindow: Window | null,
  clientX: number,
  clientY: number
) {
  if (!ownerWindow) {
    return false;
  }

  return (
    clientX < 0 ||
    clientY < 0 ||
    clientX >= ownerWindow.innerWidth ||
    clientY >= ownerWindow.innerHeight
  );
}

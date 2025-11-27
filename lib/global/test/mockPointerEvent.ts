export function mockPointerEvent({
  clientX = 0,
  clientY = 0,
  type = "pointermove"
}: {
  clientX?: number;
  clientY?: number;
  type?: PointerEvent["type"];
} = {}) {
  return {
    clientX,
    clientY,
    type
  } as PointerEvent;
}

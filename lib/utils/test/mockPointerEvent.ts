export function mockPointerEvent({
  clientX = 0,
  clientY = 0,
  movementX = clientX,
  movementY = clientY,
  type = "pointermove"
}: {
  clientX?: number;
  clientY?: number;
  movementX?: number;
  movementY?: number;
  type?: PointerEvent["type"];
} = {}) {
  return {
    clientX,
    clientY,
    movementX,
    movementY,
    type
  } as PointerEvent;
}

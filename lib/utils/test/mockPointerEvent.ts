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
  const currentTarget = document as EventTarget;

  return {
    clientX,
    clientY,
    currentTarget,
    movementX,
    movementY,
    target: currentTarget,
    type
  } as PointerEvent;
}

import type { NativeDrag } from "../mutable-state/nativeDrag";

// dragover events are dispatched every few milliseconds while the pointer is over a window (even if it doesn't move),
// so a longer gap means the pointer left every window in the group (or was released over something else, e.g. an iframe);
// other pages report the pointer over them less often (see nativeDragChannel), but still well within this gap
const MIN_DRAGOVER_GAP = 250;

// The last dragover before the pointer left a window is near its edge (within about one move of the pointer)
const MIN_EDGE_DISTANCE = 20;

/**
 * Whether a drag (using HTML drag and drop) that wasn't dropped ended outside of every window, so its tab (or tabset) can be torn off.
 *
 * The `dragend` event's position can't be used for this (it's wrong in some browsers),
 * and neither can windows' screen positions (which aren't comparable across displays in some browsers).
 * A drag canceled within a window (e.g. by pressing Escape, or released where it can't be dropped) may end a while after its last dragover event
 * (e.g. while the drag image animates back), but that event isn't near the edge of the window then.
 */
export function isNativeTearOff(drag: NativeDrag, now: number) {
  const { isDropped, lastDragover, lastMoveStep, lastRemoteDragoverTime } =
    drag;
  if (isDropped || !lastDragover) {
    return false;
  }

  // Other pages report the pointer over them too (see nativeDragChannel), e.g. when it's released over one that doesn't accept the drop
  if (
    now - lastDragover.time < MIN_DRAGOVER_GAP ||
    now - lastRemoteDragoverTime < MIN_DRAGOVER_GAP
  ) {
    return false;
  }

  const { clientX, clientY, view } = lastDragover;
  const edgeDistance = Math.min(
    clientX,
    clientY,
    view.innerWidth - clientX,
    view.innerHeight - clientY
  );

  return edgeDistance <= Math.max(lastMoveStep * 2, MIN_EDGE_DISTANCE);
}

import type { RegisteredGroup } from "../../components/group/types";
import { isCoarsePointer } from "./isCoarsePointer";

/**
 * Grows a (potentially very thin) resize target so that it satisfies the Group's minimum hit target size.
 * The rect is expanded evenly on both sides so that it remains centered on the original target.
 */
export function expandHitTarget({
  expandHitTargets,
  group,
  rect
}: {
  expandHitTargets: boolean;
  group: RegisteredGroup;
  rect: DOMRect;
}): DOMRect {
  const minHitTargetSize = expandHitTargets
    ? isCoarsePointer()
      ? group.resizeTargetMinimumSize.coarse
      : group.resizeTargetMinimumSize.fine
    : 0;

  if (rect.width < minHitTargetSize) {
    const delta = minHitTargetSize - rect.width;
    rect = new DOMRect(
      rect.x - delta / 2,
      rect.y,
      rect.width + delta,
      rect.height
    );
  }

  if (rect.height < minHitTargetSize) {
    const delta = minHitTargetSize - rect.height;
    rect = new DOMRect(
      rect.x,
      rect.y - delta / 2,
      rect.width,
      rect.height + delta
    );
  }

  return rect;
}

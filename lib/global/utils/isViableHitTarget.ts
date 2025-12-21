import { isHTMLElement } from "../../utils/isHTMLElement";
import { compare } from "../../vendor/stacking-order";
import { doRectsIntersect } from "./doRectsIntersect";

// This library adds pointer event handlers to the Window for two reasons:
// 1. It allows detecting when the pointer is "near" to a panel border or separator element,
//    (which can be particularly helpful on touch devices)
// 2. It allows detecting pointer interactions that apply to multiple, nearby panels/separators
//    (in the event of e.g. nested groups)
//
// Because events are handled at the Window, it's important to detect when another element is "above" a separator (e.g. a modal)
// as this should prevent the separator element from being clicked.
// This function does that determination.
export function isViableHitTarget({
  groupElement,
  hitRegion,
  pointerEventTarget
}: {
  groupElement: HTMLElement;
  hitRegion: DOMRect;
  pointerEventTarget: EventTarget | null;
}) {
  if (
    !isHTMLElement(pointerEventTarget) ||
    pointerEventTarget.contains(groupElement) ||
    groupElement.contains(pointerEventTarget)
  ) {
    // Calculating stacking order has a cost;
    // If either group or element contain the other, the click is safe and we can skip calculating the indices
    return true;
  }

  if (compare(pointerEventTarget, groupElement) > 0) {
    // If the pointer target is above the separator, check for overlap
    // If they are near each other, but not overlapping, then the separator is still a viable target
    //
    // Note that it's not sufficient to compare only the target
    // The target might be a small element inside of a larger container
    // (For example, a SPAN or a DIV inside of a larger modal dialog)
    let currentElement: HTMLElement | SVGElement | null = pointerEventTarget;
    while (currentElement) {
      if (currentElement.contains(groupElement)) {
        return true;
      } else if (
        doRectsIntersect(currentElement.getBoundingClientRect(), hitRegion)
      ) {
        return false;
      }

      currentElement = currentElement.parentElement;
    }
  }

  return true;
}

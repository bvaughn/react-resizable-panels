import { getClientScale } from "../../global/dom/getClientScale";
import type { DragPoint } from "../types";

type Origin = { scaleX: number; scaleY: number; x: number; y: number };

// Measured once per preview element (each drag renders a new one)
const origins = new WeakMap<HTMLElement, Origin>();

export function positionPreview(element: HTMLElement | null, point: DragPoint) {
  if (!element) {
    return;
  }

  // A fixed position element is positioned relative to the viewport, unless an ancestor has a transform, filter, or zoom;
  // the preview's untranslated position and scale are measured so that it follows the pointer either way
  let origin = origins.get(element);
  if (!origin) {
    // Offsets applied by the preview's own styles (e.g. translate: -50% -100% to center it above the pointer) are excluded,
    // so that they're preserved rather than cancelled out
    const { margin, translate } = element.style;
    element.style.margin = "0";
    element.style.transform = "none";
    element.style.translate = "none";

    const rect = element.getBoundingClientRect();
    origin = {
      scaleX: getClientScale(element, "horizontal"),
      scaleY: getClientScale(element, "vertical"),
      x: rect.left,
      y: rect.top
    };
    origins.set(element, origin);

    element.style.margin = margin;
    element.style.translate = translate;
  }

  const x = (point.clientX - origin.x) / origin.scaleX;
  const y = (point.clientY - origin.y) / origin.scaleY;

  element.style.transform = `translate(${x}px, ${y}px)`;
}

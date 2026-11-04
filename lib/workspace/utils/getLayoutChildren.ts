import { isHTMLElement } from "../../shared/utils/isHTMLElement";

/**
 * An element's children as its layout sees them:
 * - Children with "display: contents" don't generate a box, so their own children take their place (e.g. a toolbar whose items are the header's flex items)
 * - Children that don't take up space in the layout (e.g. "display: none", or "position: absolute") are skipped
 *
 * ℹ️ Only elements are returned; bare text directly within a "display: contents" child becomes an anonymous flex item of the element, which isn't measured
 */
export function getLayoutChildren(element: Element): HTMLElement[] {
  const children: HTMLElement[] = [];
  for (const child of element.children) {
    if (!isHTMLElement(child)) {
      continue;
    }

    const style = child.ownerDocument.defaultView?.getComputedStyle(child);
    if (style?.display === "contents") {
      children.push(...getLayoutChildren(child));
    } else if (
      child.offsetParent !== null &&
      style?.position !== "absolute" &&
      style?.position !== "fixed"
    ) {
      children.push(child);
    }
  }

  return children;
}

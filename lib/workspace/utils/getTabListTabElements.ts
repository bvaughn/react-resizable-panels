import { isHTMLElement } from "../../shared/utils/isHTMLElement";

/**
 * A tab list's tab elements (the elements given a tab's props by `renderTab`), in the order they're shown.
 *
 * ℹ️ They're found by their `data-tab-id` attributes, rather than as the list's children,
 * since `renderTab` may wrap them in other elements (e.g. a tooltip's trigger).
 */
export function getTabListTabElements(element: HTMLElement): HTMLElement[] {
  return Array.from(element.querySelectorAll("[data-tab][data-tab-id]")).filter(
    (child): child is HTMLElement =>
      isHTMLElement(child) && child.closest("[data-tab-list]") === element
  );
}

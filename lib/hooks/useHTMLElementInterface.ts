import { useMemo, type RefObject } from "react";
import type { SeparatorHTMLElementInterface } from "../state/types";
import type { Rect } from "../types";
import { assert } from "../utils/assert";

export function useHTMLElementInterface(
  elementRef: RefObject<HTMLElement | null>
) {
  return useMemo<SeparatorHTMLElementInterface>(
    () => ({
      focus() {
        const element = elementRef.current;
        assert(element, "Cannot measure element rect after unmount");

        element.focus();
      },
      getElementRect() {
        const element = elementRef.current;
        assert(element, "Cannot measure element rect after unmount");

        return element.getBoundingClientRect();
      },
      onResize: (callback: (rect: Rect) => void) => {
        const element = elementRef.current;
        assert(element, "Cannot listen for resize event after unmount");

        const defaultView = element.ownerDocument.defaultView;
        assert(defaultView, "Unexpected null defaultView");

        const resizeObserver = new defaultView.ResizeObserver(() => {
          callback(element.getBoundingClientRect());
        });
        resizeObserver.observe(element);

        return () => {
          resizeObserver.unobserve(element);
          resizeObserver.disconnect();
        };
      }
    }),
    [elementRef]
  );
}

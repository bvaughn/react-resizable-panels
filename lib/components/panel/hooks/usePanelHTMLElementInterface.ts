import { useMemo, type RefObject } from "react";
import { useHTMLElementInterface } from "../../../hooks/useHTMLElementInterface";
import type { PanelHTMLElementInterface } from "../../../state/types";
import type { Dimensions, Rect } from "../../../types";
import { assert } from "../../../utils/assert";

export function usePanelHTMLElementInterface(
  elementRef: RefObject<HTMLElement | null>
) {
  const elementInterface = useHTMLElementInterface(elementRef);

  return useMemo<PanelHTMLElementInterface>(() => {
    return {
      getElementFontSize() {
        const element = elementRef.current;
        assert(element, "getElementFontSize() called after unmount");

        const style = getComputedStyle(element);
        return parseFloat(style.fontSize);
      },
      getElementRect() {
        return elementInterface.getElementRect();
      },
      getRootFontSize() {
        const element = elementRef.current;
        assert(element, "getRootFontSize() called after unmount");

        const style = getComputedStyle(element.ownerDocument.body);
        return parseFloat(style.fontSize);
      },
      getWindowSize(): Dimensions {
        return {
          height: window.innerHeight,
          width: window.innerWidth
        };
      },
      onResize: (callback: (rect: Rect) => void) => {
        return elementInterface.onResize(callback);
      }
    };
  }, [elementInterface, elementRef]);
}

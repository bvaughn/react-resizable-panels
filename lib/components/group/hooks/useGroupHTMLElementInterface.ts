import { useMemo, type RefObject } from "react";
import { useHTMLElementInterface } from "../../../hooks/useHTMLElementInterface";
import type { GroupHTMLElementInterface } from "../../../state/types";
import type { Rect } from "../../../types";
import { assert } from "../../../utils/assert";
import { isHTMLElement } from "../../../utils/isHTMLElement";

export function useGroupHTMLElementInterface(
  elementRef: RefObject<HTMLElement | null>
) {
  const elementInterface = useHTMLElementInterface(elementRef);

  return useMemo<GroupHTMLElementInterface>(() => {
    return {
      getChildren() {
        const element = elementRef.current;
        assert(element, "Cannot measure Group element fontSize after unmount");

        return Array.from(element.children).filter(isHTMLElement);
      },
      getElementRect() {
        return elementInterface.getElementRect();
      },
      onResize: (callback: (rect: Rect) => void) => {
        return elementInterface.onResize(callback);
      }
    };
  }, [elementInterface, elementRef]);
}

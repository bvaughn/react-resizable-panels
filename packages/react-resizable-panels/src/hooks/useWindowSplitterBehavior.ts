import { ResizeHandler } from "../types";
import { assert } from "../utils/assert";
import { getResizeHandleElement } from "../utils/dom/getResizeHandleElement";
import { getResizeHandleElementIndex } from "../utils/dom/getResizeHandleElementIndex";
import { getResizeHandleElementsForGroup } from "../utils/dom/getResizeHandleElementsForGroup";
import { useEffect } from "../vendor/react";

// https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/

export function useWindowSplitterResizeHandlerBehavior({
  disabled,
  handleId,
  resizeHandler,
}: {
  disabled: boolean;
  handleId: string;
  resizeHandler: ResizeHandler | null;
}): void {
  useEffect(() => {
    if (disabled || resizeHandler == null) {
      return;
    }

    const handleElement = getResizeHandleElement(handleId);
    if (handleElement == null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "End":
        case "Home": {
          event.preventDefault();

          resizeHandler(event);
          break;
        }
        case "F6": {
          event.preventDefault();

          const groupId = handleElement.getAttribute("data-panel-group-id")!;

          const handles = getResizeHandleElementsForGroup(groupId);
          const index = getResizeHandleElementIndex(groupId, handleId);

          assert(index !== null);

          const nextIndex = event.shiftKey
            ? index > 0
              ? index - 1
              : handles.length - 1
            : index + 1 < handles.length
            ? index + 1
            : 0;

          const nextHandle = handles[nextIndex] as HTMLDivElement;
          nextHandle.focus();

          break;
        }
      }
    };

    handleElement.addEventListener("keydown", onKeyDown);
    return () => {
      handleElement.removeEventListener("keydown", onKeyDown);
    };
  }, [disabled, handleId, resizeHandler]);
}

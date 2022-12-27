import { RefObject, useEffect } from "react";
import { PRECISION } from "../constants";

import { CommittedValues, PanelDataMap } from "../PanelGroup";
import { ResizeHandler } from "../types";
import {
  adjustByDelta,
  getPanel,
  getPanelGroup,
  getResizeHandle,
  getResizeHandleIndex,
  getResizeHandlePanelIds,
  getResizeHandles,
  getResizeHandlesForGroup,
  getFlexGrow,
  panelsMapToSortedArray,
} from "../utils/group";

// https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/

export function useWindowSplitterPanelGroupBehavior({
  committedValuesRef,
  groupId,
  panels,
  setSizes,
  sizes,
}: {
  committedValuesRef: RefObject<CommittedValues>;
  groupId: string;
  panels: PanelDataMap;
  setSizes: (sizes: number[]) => void;
  sizes: number[];
}): void {
  useEffect(() => {
    const { direction, panels } = committedValuesRef.current;

    const groupElement = getPanelGroup(groupId);
    const { height, width } = groupElement.getBoundingClientRect();

    const handles = getResizeHandlesForGroup(groupId);
    const cleanupFunctions = handles.map((handle) => {
      const handleId = handle.getAttribute("data-panel-resize-handle-id");
      const panelsArray = panelsMapToSortedArray(panels);

      const [idBefore, idAfter] = getResizeHandlePanelIds(
        groupId,
        handleId,
        panelsArray
      );
      if (idBefore == null || idAfter == null) {
        return () => {};
      }

      const ariaValueMax = panelsArray.reduce((difference, panel) => {
        if (panel.id !== idBefore) {
          return difference - panel.minSize;
        }
        return difference;
      }, 100);

      const ariaValueMin =
        panelsArray.find((panel) => panel.id == idBefore)?.minSize ?? 0;

      const flexGrow = getFlexGrow(panels, idBefore, sizes);

      handle.setAttribute("aria-valuemax", "" + Math.round(ariaValueMax));
      handle.setAttribute("aria-valuemin", "" + Math.round(ariaValueMin));
      handle.setAttribute("aria-valuenow", "" + Math.round(parseInt(flexGrow)));

      const onKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case "Enter": {
            const index = panelsArray.findIndex(
              (panel) => panel.id === idBefore
            );
            if (index >= 0) {
              const panelData = panelsArray[index];
              const size = sizes[index];
              if (size != null) {
                let delta = 0;
                if (
                  size.toPrecision(PRECISION) <=
                  panelData.minSize.toPrecision(PRECISION)
                ) {
                  delta = direction === "horizontal" ? width : height;
                } else {
                  delta = -(direction === "horizontal" ? width : height);
                }

                const nextSizes = adjustByDelta(
                  panels,
                  idBefore,
                  idAfter,
                  delta,
                  sizes
                );
                if (sizes !== nextSizes) {
                  setSizes(nextSizes);
                }
              }
            }
            break;
          }
        }
      };

      handle.addEventListener("keydown", onKeyDown);

      const panelBefore = getPanel(idBefore);
      if (panelBefore != null) {
        handle.setAttribute("aria-controls", panelBefore.id);
      }

      return () => {
        handle.removeAttribute("aria-valuemax");
        handle.removeAttribute("aria-valuemin");
        handle.removeAttribute("aria-valuenow");

        handle.removeEventListener("keydown", onKeyDown);

        if (panelBefore != null) {
          handle.removeAttribute("aria-controls");
        }
      };
    });

    return () => {
      cleanupFunctions.forEach((cleanupFunction) => cleanupFunction());
    };
  }, [groupId, panels, sizes]);
}

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

    const handleElement = getResizeHandle(handleId);
    if (handleElement == null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
        case "ArrowUp":
        case "End":
        case "Home": {
          resizeHandler(event);
          break;
        }
        case "F6": {
          const handles = getResizeHandles();
          const index = getResizeHandleIndex(handleId);

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

import { RefObject, useEffect } from "../vendor/react";
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
import { assert } from "../utils/assert";

// https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/

export function useWindowSplitterPanelGroupBehavior({
  committedValuesRef,
  groupId,
  panels,
  setSizes,
  sizes,
  panelSizeBeforeCollapse,
}: {
  committedValuesRef: RefObject<CommittedValues>;
  groupId: string;
  panels: PanelDataMap;
  setSizes: (sizes: number[]) => void;
  sizes: number[];
  panelSizeBeforeCollapse: RefObject<Map<string, number>>;
}): void {
  useEffect(() => {
    const { direction, panels } = committedValuesRef.current!;

    const groupElement = getPanelGroup(groupId);
    assert(groupElement != null, `No group found for id "${groupId}"`);

    const { height, width } = groupElement.getBoundingClientRect();

    const handles = getResizeHandlesForGroup(groupId);
    const cleanupFunctions = handles.map((handle) => {
      const handleId = handle.getAttribute("data-panel-resize-handle-id")!;
      const panelsArray = panelsMapToSortedArray(panels);

      const [idBefore, idAfter] = getResizeHandlePanelIds(
        groupId,
        handleId,
        panelsArray
      );
      if (idBefore == null || idAfter == null) {
        return () => {};
      }

      let currentMinSize = 0;
      let currentMaxSize = 100;
      let totalMinSize = 0;
      let totalMaxSize = 0;

      // A panel's effective min/max sizes also need to account for other panel's sizes.
      panelsArray.forEach((panelData) => {
        const { id, maxSize, minSize } = panelData.current;
        if (id === idBefore) {
          currentMinSize = minSize;
          currentMaxSize = maxSize != null ? maxSize : 100;
        } else {
          totalMinSize += minSize;
          totalMaxSize += maxSize != null ? maxSize : 100;
        }
      });

      const ariaValueMax = Math.min(currentMaxSize, 100 - totalMinSize);
      const ariaValueMin = Math.max(
        currentMinSize,
        (panelsArray.length - 1) * 100 - totalMaxSize
      );

      const flexGrow = getFlexGrow(panels, idBefore, sizes);

      handle.setAttribute("aria-valuemax", "" + Math.round(ariaValueMax));
      handle.setAttribute("aria-valuemin", "" + Math.round(ariaValueMin));
      handle.setAttribute("aria-valuenow", "" + Math.round(parseInt(flexGrow)));

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented) {
          return;
        }

        switch (event.key) {
          case "Enter": {
            event.preventDefault();

            const index = panelsArray.findIndex(
              (panel) => panel.current.id === idBefore
            );
            if (index >= 0) {
              const panelData = panelsArray[index];
              const size = sizes[index];
              if (size != null) {
                let delta = 0;
                if (
                  size.toPrecision(PRECISION) <=
                  panelData.current.minSize.toPrecision(PRECISION)
                ) {
                  delta = direction === "horizontal" ? width : height;
                } else {
                  delta = -(direction === "horizontal" ? width : height);
                }

                const nextSizes = adjustByDelta(
                  event,
                  committedValuesRef.current!,
                  idBefore,
                  idAfter,
                  delta,
                  sizes,
                  panelSizeBeforeCollapse.current!,
                  null
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
  }, [
    committedValuesRef,
    groupId,
    panels,
    panelSizeBeforeCollapse,
    setSizes,
    sizes,
  ]);
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

          const handles = getResizeHandles();
          const index = getResizeHandleIndex(handleId);

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

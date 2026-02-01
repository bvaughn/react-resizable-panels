import { useMemo } from "react";
import type { MutablePanel } from "../../../state/MutablePanel";
import { formatLayoutNumber } from "../../../utils/formatLayoutNumber";
import { layoutNumbersEqual } from "../../../utils/layoutNumbersEqual";
import type { PanelImperativeHandle } from "../types";
import { getPanelSize } from "../utils/getPanelSize";
import { setPanelSize } from "../utils/setPanelSize";

export function usePanelImperativeHandle(panel: MutablePanel) {
  return useMemo<PanelImperativeHandle>(() => {
    return {
      collapse: () => {
        const { collapsible, collapsedSize } = panel;
        const size = getPanelSize(panel);

        if (collapsible && size !== collapsedSize) {
          // Store previous size in to restore if expand() is called
          panel.expandToSize = size;

          setPanelSize(panel, collapsedSize);
        }
      },
      expand: () => {
        const { collapsible, collapsedSize, minSize } = panel;
        const size = getPanelSize(panel);

        if (collapsible && size === collapsedSize) {
          // Restore pre-collapse size, fallback to minSize
          let nextSize = panel.expandToSize ?? minSize;

          // Edge case: if minSize is 0, pick something meaningful to expand the panel to
          if (nextSize === 0) {
            nextSize = 1;
          }

          setPanelSize(panel, nextSize);
        }
      },
      getSize: () => {
        const { elementInterface, group } = panel;

        const asPercentage = getPanelSize(panel);
        const rect = elementInterface.getElementRect();
        const inPixels =
          group.orientation === "horizontal" ? rect.width : rect.height;

        return {
          asPercentage,
          inPixels
        };
      },
      isCollapsed: () => {
        const { collapsible, collapsedSize } = panel;

        const size = getPanelSize(panel);

        return collapsible && layoutNumbersEqual(collapsedSize, size);
      },
      resize: (size: number | string) => {
        const prevSize = getPanelSize(panel);
        if (prevSize !== size) {
          let asPercentage;
          switch (typeof size) {
            case "number": {
              const { group } = panel;
              asPercentage = formatLayoutNumber((size / group.groupSize) * 100);
              break;
            }
            case "string": {
              asPercentage = parseFloat(size);
              break;
            }
          }

          setPanelSize(panel, asPercentage);
        }
      }
    };
  }, [panel]);
}

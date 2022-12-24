import { RefObject, useEffect } from "react";

import { CommittedValues, PanelDataMap } from "../PanelGroup";
import {
  getPanel,
  getResizeHandlePanelIds,
  getResizeHandlesForGroup,
  getSize,
  panelsMapToSortedArray,
} from "../utils/group";

// https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/
export default function useWindowSplitterAriaAttributes({
  committedValuesRef,
  groupId,
  panels,
  sizes,
}: {
  committedValuesRef: RefObject<CommittedValues>;
  groupId: string;
  panels: PanelDataMap;
  sizes: number[];
}) {
  useEffect(() => {
    const { direction, height, panels, width } = committedValuesRef.current;

    const handles = getResizeHandlesForGroup(groupId);
    handles.forEach((handle) => {
      const handleId = handle.getAttribute("data-panel-resize-handle-id");
      const panelsArray = panelsMapToSortedArray(panels);

      const [idBefore] = getResizeHandlePanelIds(
        groupId,
        handleId,
        panelsArray
      );
      if (idBefore == null) {
        return;
      }

      const ariaValueMax = panelsArray.reduce((difference, panel) => {
        if (panel.id !== idBefore) {
          return difference - panel.minSize;
        }
        return difference;
      }, 1);
      const ariaValueMin =
        panelsArray.find((panel) => panel.id == idBefore)?.minSize ?? 0;

      const size = getSize(panels, idBefore, direction, sizes, height, width);
      const ariaValueNow = size / (direction === "horizontal" ? width : height);

      handle.setAttribute("aria-valuemax", "" + Math.round(100 * ariaValueMax));
      handle.setAttribute("aria-valuemin", "" + Math.round(100 * ariaValueMin));
      handle.setAttribute("aria-valuenow", "" + Math.round(100 * ariaValueNow));

      const panelBefore = getPanel(idBefore);
      if (panelBefore == null) {
        return;
      }

      handle.setAttribute("aria-controls", panelBefore.id);
    });
  }, [groupId, panels, sizes]);
}

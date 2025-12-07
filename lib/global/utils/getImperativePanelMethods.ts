import type { PanelImperativeHandle } from "../../components/panel/types";
import { calculateAvailableGroupSize } from "../dom/calculateAvailableGroupSize";
import { read } from "../mutableState";
import { formatLayoutNumber } from "./formatLayoutNumber";
import { layoutNumbersEqual } from "./layoutNumbersEqual";

export function getImperativePanelMethods({
  groupId,
  panelId
}: {
  groupId: string;
  panelId: string;
}): PanelImperativeHandle {
  const find = () => {
    const { mountedGroups } = read();
    for (const [group, { derivedPanelConstraints, layout }] of mountedGroups) {
      if (group.id === groupId) {
        return { derivedPanelConstraints, group, layout };
      }
    }

    throw Error(`Group ${groupId} not found`);
  };

  const getPanelConstraints = () => {
    const match = find().derivedPanelConstraints.find(
      (current) => current.panelId === panelId
    );
    if (match !== undefined) {
      return match;
    }

    throw Error(`Panel constraints not found for Panel ${panelId}`);
  };

  const getPanel = () => {
    const match = find().group.panels.find((current) => current.id === panelId);
    if (match !== undefined) {
      return match;
    }

    throw Error(`Layout not found for Panel ${panelId}`);
  };

  const getPanelSize = () => {
    const match = find().layout[panelId];
    if (match !== undefined) {
      return match;
    }

    throw Error(`Layout not found for Panel ${panelId}`);
  };

  const setPanelSize = (_size: number) => {
    // TODO Calculate next layout
    // TODO Validate next layout
    // TODO Update group state
  };

  return {
    collapse: () => {
      const { collapsible, collapsedSize } = getPanelConstraints();
      const size = getPanelSize();

      if (collapsible && size !== collapsedSize) {
        setPanelSize(collapsedSize);
      }
    },
    expand: () => {
      const { collapsible, collapsedSize, minSize } = getPanelConstraints();
      const size = getPanelSize();

      if (collapsible && size === collapsedSize) {
        setPanelSize(minSize);
      }
    },
    getSize: () => {
      const { group } = find();
      const asPercentage = getPanelSize();
      const { element } = getPanel();

      const inPixels =
        group.orientation === "horizontal"
          ? element.offsetWidth
          : element.offsetHeight;

      return {
        asPercentage,
        inPixels
      };
    },
    isCollapsed: () => {
      const { collapsible, collapsedSize } = getPanelConstraints();
      const size = getPanelSize();

      return collapsible && layoutNumbersEqual(collapsedSize, size);
    },
    resize: (size: number | string) => {
      const prevSize = getPanelSize();
      if (prevSize !== size) {
        let asPercentage;
        switch (typeof size) {
          case "number": {
            const { group } = find();
            const groupSize = calculateAvailableGroupSize({ group });
            asPercentage = formatLayoutNumber((size / groupSize) * 100);
            break;
          }
          case "string": {
            asPercentage = parseFloat(size);
            break;
          }
        }

        setPanelSize(asPercentage);
      }
    }
  } satisfies PanelImperativeHandle;
}

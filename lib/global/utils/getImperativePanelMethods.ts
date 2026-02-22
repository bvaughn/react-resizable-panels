import type { PanelImperativeHandle } from "../../components/panel/types";
import { calculateAvailableGroupSize } from "../dom/calculateAvailableGroupSize";
import { getMountedGroups, updateMountedGroup } from "../mutable-state/groups";
import { adjustLayoutByDelta } from "./adjustLayoutByDelta";
import { formatLayoutNumber } from "./formatLayoutNumber";
import { layoutNumbersEqual } from "./layoutNumbersEqual";
import { layoutsEqual } from "./layoutsEqual";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

export function getImperativePanelMethods({
  groupId,
  panelId
}: {
  groupId: string;
  panelId: string;
}): PanelImperativeHandle {
  const find = () => {
    const mountedGroups = getMountedGroups();
    for (const [
      group,
      {
        defaultLayoutDeferred,
        derivedPanelConstraints,
        layout,
        separatorToPanels
      }
    ] of mountedGroups) {
      if (group.id === groupId) {
        return {
          defaultLayoutDeferred,
          derivedPanelConstraints,
          group,
          layout,
          separatorToPanels
        };
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

  const setPanelSize = (nextSize: number) => {
    const prevSize = getPanelSize();
    if (nextSize === prevSize) {
      return;
    }

    const {
      defaultLayoutDeferred,
      derivedPanelConstraints,
      group,
      layout: prevLayout,
      separatorToPanels
    } = find();

    const index = group.panels.findIndex((current) => current.id === panelId);
    const isLastPanel = index === group.panels.length - 1;

    const unsafeLayout = adjustLayoutByDelta({
      delta: isLastPanel ? prevSize - nextSize : nextSize - prevSize,
      initialLayout: prevLayout,
      panelConstraints: derivedPanelConstraints,
      pivotIndices: isLastPanel ? [index - 1, index] : [index, index + 1],
      prevLayout,
      trigger: "imperative-api"
    });

    const nextLayout = validatePanelGroupLayout({
      layout: unsafeLayout,
      panelConstraints: derivedPanelConstraints
    });
    if (!layoutsEqual(prevLayout, nextLayout)) {
      updateMountedGroup(group, {
        defaultLayoutDeferred,
        derivedPanelConstraints,
        layout: nextLayout,
        separatorToPanels
      });
    }
  };

  return {
    collapse: () => {
      const { collapsible, collapsedSize } = getPanelConstraints();
      const { mutableValues } = getPanel();
      const size = getPanelSize();

      if (collapsible && size !== collapsedSize) {
        // Store previous size in to restore if expand() is called
        mutableValues.expandToSize = size;

        setPanelSize(collapsedSize);
      }
    },
    expand: () => {
      const { collapsible, collapsedSize, minSize } = getPanelConstraints();
      const { mutableValues } = getPanel();
      const size = getPanelSize();

      if (collapsible && size === collapsedSize) {
        // Restore pre-collapse size, fallback to minSize
        let nextSize = mutableValues.expandToSize ?? minSize;

        // Edge case: if minSize is 0, pick something meaningful to expand the panel to
        if (nextSize === 0) {
          nextSize = 1;
        }

        setPanelSize(nextSize);
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

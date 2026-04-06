import type { Layout } from "../../components/group/types";
import type {
  PanelConstraints,
  PanelImperativeHandle,
  RegisteredPanel
} from "../../components/panel/types";
import { calculateAvailableGroupSize } from "../dom/calculateAvailableGroupSize";
import { getMountedGroups, updateMountedGroup } from "../mutable-state/groups";
import { sizeStyleToPixels } from "../styles/sizeStyleToPixels";
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
        groupSize,
        separatorToPanels
      }
    ] of mountedGroups) {
      if (group.id === groupId) {
        return {
          defaultLayoutDeferred,
          derivedPanelConstraints,
          group,
          groupSize,
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

  /**
   * Compute the next (unvalidated) layout when resizing a panel imperatively.
   *
   * Handles the edge case where the last panel is being collapsed but all
   * preceding panels are already collapsed — the normal reversed-delta logic
   * would cascade the freed space to the first panel. Instead the last panel
   * keeps the remainder so it stays the largest.
   */
  const computeLayout = ({
    nextSize,
    panels,
    prevLayout,
    derivedPanelConstraints
  }: {
    nextSize: number;
    panels: RegisteredPanel[];
    prevLayout: Layout;
    derivedPanelConstraints: PanelConstraints[];
  }): Layout => {
    const prevSize = getPanelSize();

    const index = panels.findIndex((current) => current.id === panelId);
    const isLastPanel = index === panels.length - 1;

    if (
      isLastPanel &&
      nextSize < prevSize &&
      index > 0 &&
      panels.slice(0, index).every((_panel, panelIndex) => {
        const pc = derivedPanelConstraints[panelIndex];
        return (
          pc?.collapsible &&
          layoutNumbersEqual(pc.collapsedSize, prevLayout[pc.panelId])
        );
      })
    ) {
      const occupiedByPrevious = panels
        .slice(0, index)
        .reduce((total, panel) => total + prevLayout[panel.id], 0);
      return {
        ...prevLayout,
        [panelId]: formatLayoutNumber(100 - occupiedByPrevious)
      };
    }

    return adjustLayoutByDelta({
      delta: isLastPanel ? prevSize - nextSize : nextSize - prevSize,
      initialLayout: prevLayout,
      panelConstraints: derivedPanelConstraints,
      pivotIndices: isLastPanel ? [index - 1, index] : [index, index + 1],
      prevLayout,
      trigger: "imperative-api"
    });
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
      groupSize,
      layout: prevLayout,
      separatorToPanels
    } = find();

    const unsafeLayout = computeLayout({
      nextSize,
      panels: group.panels,
      prevLayout,
      derivedPanelConstraints
    });

    const nextLayout = validatePanelGroupLayout({
      layout: unsafeLayout,
      panelConstraints: derivedPanelConstraints
    });
    if (!layoutsEqual(prevLayout, nextLayout)) {
      updateMountedGroup(group, {
        defaultLayoutDeferred,
        derivedPanelConstraints,
        groupSize,
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
      const { group } = find();
      const { element } = getPanel();
      const groupSize = calculateAvailableGroupSize({ group });

      const asPixels = sizeStyleToPixels({
        groupSize,
        panelElement: element,
        styleProp: size
      });

      const asPercentage = formatLayoutNumber((asPixels / groupSize) * 100);

      setPanelSize(asPercentage);
    }
  } satisfies PanelImperativeHandle;
}

import type { GroupImperativeHandle } from "../../flex/types";
import { getMountedAxes, updateMountedAxis } from "../mutable-state/axes";
import type { Layout } from "../types";
import { layoutsEqual } from "./layoutsEqual";
import { syncAxisStateToCurrentSize } from "./syncAxisStateToCurrentSize";
import { validateAxisLayout } from "./validateAxisLayout";

export function getImperativeAxisMethods({
  axisId
}: {
  axisId: string;
}): GroupImperativeHandle {
  const find = () => {
    const mountedAxes = getMountedAxes();
    for (const [axis, value] of mountedAxes) {
      if (axis.id === axisId) {
        return { axis, ...value };
      }
    }

    throw Error(`Could not find Group with id "${axisId}"`);
  };

  return {
    getLayout() {
      const { defaultLayoutDeferred, layout } = find();

      if (defaultLayoutDeferred) {
        // This indicates that the Group has not finished mounting yet
        // Likely because it has been rendered inside of a hidden DOM subtree
        // Any layout value will not have been validated and so it should not be returned
        return {};
      }

      return layout;
    },
    setLayout(unsafeLayout: Layout) {
      const { axis, ...axisState } = find();

      // The axis may have been resized since its ResizeObserver last ran,
      // in which case its pixel based constraints are stale (see #770)
      const synced = syncAxisStateToCurrentSize({ axis, axisState });
      const state = synced?.state ?? axisState;
      const {
        defaultLayoutDeferred,
        derivedItemConstraints,
        axisSize,
        layout: prevLayout
      } = state;

      const nextLayout = validateAxisLayout({
        layout: unsafeLayout,
        itemConstraints: derivedItemConstraints
      });

      if (defaultLayoutDeferred) {
        // This indicates that the Group has not finished mounting yet
        // Likely because it has been rendered inside of a hidden DOM subtree
        // In this case we cannot fully validate the layout, so we shouldn't apply it
        // It's okay to run the validate function above though,
        // it will still warn about certain types of errors (e.g. wrong number of panels)
        return prevLayout;
      }

      if (synced?.changed || !layoutsEqual(prevLayout, nextLayout)) {
        updateMountedAxis(axis, {
          ...state,
          layout: nextLayout,
          requestedAxisSize: axisSize,
          requestedLayout: nextLayout
        });
      }

      return nextLayout;
    }
  };
}

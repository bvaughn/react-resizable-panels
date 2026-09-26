import type { GroupImperativeHandle } from "../../components/group/types";
import { getMountedAxes, updateMountedAxis } from "../mutable-state/axes";
import type { Layout } from "../types";
import { layoutsEqual } from "./layoutsEqual";
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
      const {
        defaultLayoutDeferred,
        derivedItemConstraints,
        axis,
        axisSize,
        layout: prevLayout,
        separatorToItems
      } = find();

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

      if (!layoutsEqual(prevLayout, nextLayout)) {
        updateMountedAxis(axis, {
          defaultLayoutDeferred,
          derivedItemConstraints,
          axisSize,
          layout: nextLayout,
          separatorToItems
        });
      }

      return nextLayout;
    }
  };
}

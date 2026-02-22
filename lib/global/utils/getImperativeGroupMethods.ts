import type {
  GroupImperativeHandle,
  Layout
} from "../../components/group/types";
import { getMountedGroups, updateMountedGroup } from "../mutable-state/groups";
import { layoutsEqual } from "./layoutsEqual";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

export function getImperativeGroupMethods({
  groupId
}: {
  groupId: string;
}): GroupImperativeHandle {
  const find = () => {
    const mountedGroups = getMountedGroups();
    for (const [group, value] of mountedGroups) {
      if (group.id === groupId) {
        return { group, ...value };
      }
    }

    throw Error(`Could not find Group with id "${groupId}"`);
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
        derivedPanelConstraints,
        group,
        layout: prevLayout,
        separatorToPanels
      } = find();

      const nextLayout = validatePanelGroupLayout({
        layout: unsafeLayout,
        panelConstraints: derivedPanelConstraints
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
        updateMountedGroup(group, {
          defaultLayoutDeferred,
          derivedPanelConstraints,
          layout: nextLayout,
          separatorToPanels
        });
      }

      return nextLayout;
    }
  };
}

import type {
  GroupImperativeHandle,
  Layout
} from "../../components/group/types";
import { read, update } from "../mutableState";
import {
  getNextGroupLayoutState,
  scheduleLayoutSmoothing
} from "./layoutSmoothing";
import { validatePanelGroupLayout } from "./validatePanelGroupLayout";

export function getImperativeGroupMethods({
  groupId
}: {
  groupId: string;
}): GroupImperativeHandle {
  const find = () => {
    const { mountedGroups } = read();
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
      const { group, ...current } = find();
      const {
        defaultLayoutDeferred,
        derivedPanelConstraints,
        layout: prevLayout
      } = current;

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

      const { next, didChange, shouldSchedule } = getNextGroupLayoutState({
        group,
        current,
        layoutTarget: nextLayout
      });

      if (didChange) {
        update((prevState) => ({
          mountedGroups: new Map(prevState.mountedGroups).set(group, next)
        }));
      }

      if (shouldSchedule) {
        scheduleLayoutSmoothing();
      }

      return nextLayout;
    }
  };
}

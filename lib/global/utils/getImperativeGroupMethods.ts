import type {
  GroupImperativeHandle,
  Layout
} from "../../components/group/types";
import { read, update } from "../mutableState";
import { layoutsEqual } from "./layoutsEqual";
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
        // Don't return layouts that have not been validated
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
        // Don't apply layouts that can't be validated
        // It's okay to let the validation run above;
        // that will still warn about certain types of error (e.g. wrong number of panels)
        return prevLayout;
      }

      if (!layoutsEqual(prevLayout, nextLayout)) {
        update((prevState) => ({
          mountedGroups: new Map(prevState.mountedGroups).set(group, {
            defaultLayoutDeferred,
            derivedPanelConstraints,
            layout: nextLayout,
            separatorToPanels
          })
        }));
      }

      return nextLayout;
    }
  };
}

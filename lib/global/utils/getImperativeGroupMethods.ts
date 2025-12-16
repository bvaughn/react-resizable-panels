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

    throw Error(`Group ${groupId} not found`);
  };

  return {
    getLayout() {
      const { layout } = find();

      return layout;
    },
    setLayout(unsafeLayout: Layout) {
      const {
        derivedPanelConstraints,
        group,
        layout: prevLayout,
        separatorToPanels
      } = find();

      const nextLayout = validatePanelGroupLayout({
        layout: unsafeLayout,
        panelConstraints: derivedPanelConstraints
      });

      if (!layoutsEqual(prevLayout, nextLayout)) {
        update((prevState) => ({
          mountedGroups: new Map(prevState.mountedGroups).set(group, {
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

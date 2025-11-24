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
    for (const [group, { derivedPanelConstraints, layout }] of mountedGroups) {
      if (group.id === groupId) {
        return { derivedPanelConstraints, group, layout };
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
      const { derivedPanelConstraints, group, layout: prevLayout } = find();

      const nextLayout = validatePanelGroupLayout({
        layout: unsafeLayout,
        panelConstraints: derivedPanelConstraints
      });

      if (!layoutsEqual(prevLayout, nextLayout)) {
        update((prevState) => ({
          mountedGroups: new Map(prevState.mountedGroups).set(group, {
            derivedPanelConstraints,
            layout: nextLayout
          })
        }));
      }

      return nextLayout;
    }
  };
}

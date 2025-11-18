import type {
  GroupImperativeHandle,
  Layout
} from "../../components/group/types";
import { read } from "../mutableState";

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
    setLayout(_layout: Layout) {
      // TODO Validate next layout
      // TODO Update group state
    }
  };
}

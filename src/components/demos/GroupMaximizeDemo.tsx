import { type Ref, useState } from "react";
import type { GroupImperativeHandle } from "react-resizable-panels";
import { MaximizeButton } from "../MaximizeButton";
import { Group } from "../styled-panels/Group";
import { Panel } from "../styled-panels/Panel";
import { Separator } from "../styled-panels/Separator";

const MAXIMIZED_SIZE = 75;

/**
 * Demonstrates the imperative Group API with maximize/restore toggles;
 * shared by the useGroupRef and useGroupCallbackRef pages.
 */
export function GroupMaximizeDemo({
  getGroup,
  groupRef
}: {
  getGroup: () => GroupImperativeHandle | null;
  groupRef: Ref<GroupImperativeHandle | null>;
}) {
  const [maximizedId, setMaximizedId] = useState<string | undefined>();

  const toggle = (id: "left" | "right") => {
    const group = getGroup();
    if (maximizedId === id) {
      group?.setLayout({ left: 50, right: 50 });
    } else if (id === "left") {
      group?.setLayout({ left: MAXIMIZED_SIZE, right: 25 });
    } else {
      group?.setLayout({ left: 25, right: MAXIMIZED_SIZE });
    }
  };

  return (
    <Group
      className="h-30!"
      groupRef={groupRef}
      onLayoutChanged={(layout) =>
        setMaximizedId(
          Object.keys(layout).find(
            (id) => Math.round(layout[id]) === MAXIMIZED_SIZE
          )
        )
      }
    >
      <Panel className="relative" id="left" minSize="20%" showSizeAsPercentage>
        left
        <MaximizeButton
          isMaximized={maximizedId === "left"}
          label="left panel"
          onClick={() => toggle("left")}
        />
      </Panel>
      <Separator />
      <Panel className="relative" id="right" minSize="20%" showSizeAsPercentage>
        right
        <MaximizeButton
          isMaximized={maximizedId === "right"}
          label="right panel"
          onClick={() => toggle("right")}
        />
      </Panel>
    </Group>
  );
}

import type { Layout, RegisteredGroup } from "../components/group/types";
import type {
  PanelConstraints,
  RegisteredPanel
} from "../components/panel/types";
import type { RegisteredSeparator } from "../components/separator/types";
import { EventEmitter } from "../utils/EventEmitter";
import type { InteractionState } from "./types";
import { layoutNumbersEqual } from "./utils/layoutNumbersEqual";

type UpdaterFunction = (prevState: State) => Partial<State>;

export type SeparatorToPanelsMap = Map<
  RegisteredSeparator,
  [primaryPanel: RegisteredPanel, secondaryPanel: RegisteredPanel]
>;

export type MountedGroup = {
  defaultLayoutDeferred: boolean;
  derivedPanelConstraints: PanelConstraints[];
  layout: Layout;
  layoutTarget: Layout;
  separatorToPanels: SeparatorToPanelsMap;
};

export type MountedGroupMap = Map<RegisteredGroup, MountedGroup>;

type Events = {
  cursorFlagsChange: number;
  interactionStateChange: InteractionState;
  mountedGroupsChange: MountedGroupMap;
};

type State = {
  cursorFlags: number;
  interactionState: InteractionState;
  mountedGroups: MountedGroupMap;
};

let state: State = {
  cursorFlags: 0,
  interactionState: {
    state: "inactive"
  },
  mountedGroups: new Map()
};

export const eventEmitter = new EventEmitter<Events>();

export function read(): State {
  return state;
}

export function update(value: Partial<State> | UpdaterFunction) {
  const partialState = typeof value === "function" ? value(state) : value;
  if (state === partialState) {
    return state;
  }

  const prevState = state;

  state = {
    ...state,
    ...partialState
  };

  if (partialState.cursorFlags !== undefined) {
    eventEmitter.emit("cursorFlagsChange", state.cursorFlags);
  }

  if (partialState.interactionState !== undefined) {
    eventEmitter.emit("interactionStateChange", state.interactionState);
  }

  if (partialState.mountedGroups !== undefined) {
    // If any collapsible Panels have been collapsed by this size change, record their previous sizes
    state.mountedGroups.forEach((value, group) => {
      value.derivedPanelConstraints.forEach((constraints) => {
        if (constraints.collapsible) {
          const prevGroup = prevState.mountedGroups.get(group);
          const prevLayoutTarget = prevGroup?.layoutTarget ?? prevGroup?.layout;
          const nextLayoutTarget = value.layoutTarget ?? value.layout;
          const prevTargetValue = prevLayoutTarget?.[constraints.panelId];
          const nextTargetValue = nextLayoutTarget?.[constraints.panelId];

          if (prevTargetValue !== undefined && nextTargetValue !== undefined) {
            const isCollapsed = layoutNumbersEqual(
              constraints.collapsedSize,
              nextTargetValue
            );
            const wasCollapsed = layoutNumbersEqual(
              constraints.collapsedSize,
              prevTargetValue
            );
            if (isCollapsed && !wasCollapsed) {
              group.inMemoryLastExpandedPanelSizes[constraints.panelId] =
                prevTargetValue;
            }
          }
        }
      });
    });

    eventEmitter.emit("mountedGroupsChange", state.mountedGroups);
  }

  return state;
}

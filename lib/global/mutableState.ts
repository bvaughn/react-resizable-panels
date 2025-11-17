import type { Layout, RegisteredGroup } from "../components/group/types";
import type { PanelConstraints } from "../components/panel/types";
import { EventEmitter } from "../utils/EventEmitter";
import type { InteractionState } from "./types";

type UpdaterFunction = (prevState: State) => Partial<State>;

export type MountedGroupMap = Map<
  RegisteredGroup,
  {
    derivedPanelConstraints: PanelConstraints[];
    layout: Layout;
  }
>;

type Events = {
  interactionStateChange: InteractionState;
  mountedGroupsChange: MountedGroupMap;
};

type State = {
  interactionState: InteractionState;
  mountedGroups: MountedGroupMap;
};

let state: State = {
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

  state = {
    ...state,
    ...partialState
  };

  if (partialState.interactionState !== undefined) {
    eventEmitter.emit("interactionStateChange", state.interactionState);
  }

  if (partialState.mountedGroups !== undefined) {
    eventEmitter.emit("mountedGroupsChange", state.mountedGroups);
  }

  return state;
}

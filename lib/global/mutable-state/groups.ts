import type { Layout, RegisteredGroup } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { EventEmitter } from "../../utils/EventEmitter";
import type { SeparatorToPanelsMap } from "./types";

type State = {
  defaultLayoutDeferred: boolean;
  derivedPanelConstraints: PanelConstraints[];
  layout: Layout;
  separatorToPanels: SeparatorToPanelsMap;
};

export type MountedGroups = Map<RegisteredGroup, State>;

let map: MountedGroups = new Map();

type GroupChangeEvent = {
  group: RegisteredGroup;
  next: State;
  prev: State | undefined;
};
type GroupsChangeEvent = {
  next: MountedGroups;
  prev: MountedGroups;
};

const eventEmitter = new EventEmitter<{
  groupChange: GroupChangeEvent;
  groupsChange: GroupsChangeEvent;
}>();

export function deleteMutableGroup(group: RegisteredGroup) {
  map = new Map(map);
  map.delete(group);
}

export function getRegisteredGroup(
  groupId: string
): RegisteredGroup | undefined;
export function getRegisteredGroup(
  groupId: string,
  assert: true
): RegisteredGroup;
export function getRegisteredGroup(groupId: string, assert?: boolean) {
  for (const [group] of map) {
    if (group.id === groupId) {
      return group;
    }
  }

  if (assert) {
    throw Error(`Could not find data for Group with id ${groupId}`);
  }

  return undefined;
}

export function getMountedGroupState(groupId: string): State | undefined;
export function getMountedGroupState(groupId: string, assert: true): State;
export function getMountedGroupState(groupId: string, assert?: boolean) {
  for (const [group, mountedGroup] of map) {
    if (group.id === groupId) {
      return mountedGroup;
    }
  }

  if (assert) {
    throw Error(`Could not find data for Group with id ${groupId}`);
  }

  return undefined;
}

export function getMountedGroups() {
  return map;
}

export function subscribeToMountedGroup(
  groupId: string,
  callback: (event: GroupChangeEvent) => void
) {
  return eventEmitter.addListener("groupChange", (event) => {
    if (event.group.id === groupId) {
      callback(event);
    }
  });
}

export function updateMountedGroup(group: RegisteredGroup, next: State) {
  const prev = map.get(group);

  map = new Map(map);
  map.set(group, next);

  eventEmitter.emit("groupChange", {
    group,
    prev,
    next
  });
}

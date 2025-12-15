import type { RegisteredGroup } from "../../components/group/types";
import { assert } from "../../utils/assert";
import { read } from "../mutableState";

export function getMountedGroup(group: RegisteredGroup) {
  const { mountedGroups } = read();

  const mountedGroup = mountedGroups.get(group);
  assert(mountedGroup, `Mounted Group ${group.id} not found`);

  return mountedGroup;
}

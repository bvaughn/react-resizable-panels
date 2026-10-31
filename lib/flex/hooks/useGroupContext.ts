import { useContext } from "react";
import { assert } from "../../shared/utils/assert";
import { GroupContext } from "../contexts/GroupContext";

export function useGroupContext() {
  const context = useContext(GroupContext);
  assert(
    context,
    "Group Context not found; did you render a Panel or Separator outside of a Group?"
  );

  return context;
}

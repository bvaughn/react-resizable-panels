import { useContext } from "react";
import { assert } from "../../utils/assert";
import { GroupContext } from "./GroupContext";

export function useGroupContext() {
  const context = useContext(GroupContext);
  assert(context, "Unexpected");

  return context;
}

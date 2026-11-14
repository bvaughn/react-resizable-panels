import type { WorkspaceElementValue } from "../types";

/**
 * Resolves an entry of the Workspace's `classNames` or `styles` props, which may be a function of the node the element belongs to (see `WorkspaceElementValue`);
 * the arguments are only computed when it is a function.
 */
export function resolveElementValue<Value, Args extends unknown[]>(
  value: WorkspaceElementValue<Value, Args> | undefined,
  getArgs: () => Args
): Value | undefined {
  return typeof value === "function"
    ? (value as (...args: Args) => Value)(...getArgs())
    : value;
}

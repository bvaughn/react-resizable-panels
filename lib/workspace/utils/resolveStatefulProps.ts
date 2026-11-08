import type { CSSProperties, ReactNode } from "react";
import type { StatefulProps, ValueOrFunction } from "../types";

function resolve<Value, State>(
  value: ValueOrFunction<Value, State>,
  state: State
): Value {
  return typeof value === "function"
    ? (value as (state: State) => Value)(state)
    : value;
}

/**
 * Resolves the props of a Workspace button (or handle) that can be functions of its state (see `StatefulProps`), e.g. `children`.
 */
export function resolveStatefulProps<State>(
  { children, className, style, title }: StatefulProps<State>,
  state: State
): {
  children: ReactNode;
  className: string | undefined;
  style: CSSProperties | undefined;
  title: string | undefined;
} {
  return {
    children: resolve(children, state),
    className: resolve(className, state),
    style: resolve(style, state),
    title: resolve(title, state)
  };
}

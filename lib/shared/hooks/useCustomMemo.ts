import { useMemo, useRef } from "react";

/**
 * Like `useMemo`, but dependencies are compared using a custom equality function (rather than `Object.is`);
 * e.g. so that props written inline (like arrays) can be compared by value.
 */
export function useCustomMemo<Type, Deps extends readonly unknown[]>(
  factory: () => Type,
  deps: Deps,
  isEqual: (prevDeps: Deps, nextDeps: Deps) => boolean
): Type {
  const prevDepsRef = useRef<Deps>(deps);
  const versionRef = useRef(0);

  if (!isEqual(prevDepsRef.current, deps)) {
    prevDepsRef.current = deps;
    versionRef.current++;
  }

  // The version only changes when the dependencies do (as determined by isEqual)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, [versionRef.current]);
}

import { useCallback, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

// Forked from useEventCallback (usehooks-ts)
export function useStableCallback<Return>(fn: () => Return): () => Return;
export function useStableCallback<Args, Return>(
  fn: (args: Args) => Return
): (args: Args) => Return;
export function useStableCallback<Args, Return>(
  fn: (args: Args) => Return
): (args: Args) => Return {
  const ref = useRef<typeof fn>(fn);

  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((args: Args) => ref.current?.(args), [ref]) as (
    args: Args
  ) => Return;
}

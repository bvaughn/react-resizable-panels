import { useState } from "react";
import {
  getMountedAxisState,
  getRegisteredAxis,
  subscribeToMountedAxis
} from "../../global/mutable-state/axes";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

// Axis ids can contain any character, so the dependency key uses one that ids are very unlikely to contain
const SEPARATOR = "\u0000";

// Frames are requested from the axis' own window (e.g. a popout's), because the opener's frames pause when it's in the background
function requestFrame(axisId: string, callback: () => void) {
  const view = getRegisteredAxis(axisId)?.element.ownerDocument.defaultView;
  const win =
    typeof view?.requestAnimationFrame === "function" ? view : globalThis;

  if (typeof win.requestAnimationFrame === "function") {
    const id = win.requestAnimationFrame(callback);
    return () => win.cancelAnimationFrame(id);
  }

  const id = setTimeout(callback, 16);
  return () => clearTimeout(id);
}

/**
 * Whether the specified resize axes are still waiting for their layouts to be applied:
 * before they've been mounted (e.g. when server rendering), while their layouts are deferred (e.g. hidden groups),
 * and for a couple of frames after that, so that the browser has applied the laid out sizes.
 *
 * Before an axis is laid out, its items are sized differently (e.g. panels by their default sizes, using flex-basis),
 * so a CSS transition on their sizes would animate them from those sizes (or from nothing) as the page loads.
 */
export function useIsLayoutPending(axisIds: readonly string[]): boolean {
  const key = axisIds.join(SEPARATOR);

  const [isPending, setIsPending] = useState(true);

  useIsomorphicLayoutEffect(() => {
    const ids = key === "" ? [] : key.split(SEPARATOR);

    // Layouts change often (e.g. on every pointer move), so only re-render when the value changes
    let current: boolean | undefined;
    const update = (next: boolean) => {
      if (next !== current) {
        current = next;
        setIsPending(next);
      }
    };

    let cancelFrame: (() => void) | null = null;
    const cancel = () => {
      cancelFrame?.();
      cancelFrame = null;
    };

    const check = () => {
      const isLaidOut =
        ids.length > 0 &&
        ids.every((id) => {
          const state = getMountedAxisState(id);
          return state !== undefined && !state.defaultLayoutDeferred;
        });
      if (!isLaidOut) {
        cancel();
        update(true);
        return;
      }

      if (current === false || cancelFrame !== null) {
        return;
      }

      // Callbacks for the next frame run before its styles are calculated,
      // so waiting for one frame wouldn't separate the laid out sizes from the end of this state;
      // the second frame runs after the browser has rendered them
      cancelFrame = requestFrame(ids[0], () => {
        cancelFrame = requestFrame(ids[0], () => {
          cancelFrame = null;
          update(false);
        });
      });
    };

    const unsubscribes = ids.map((id) => subscribeToMountedAxis(id, check));

    check();

    return () => {
      cancel();
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [key]);

  return isPending;
}

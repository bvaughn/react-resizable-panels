import { useRef } from "react";
import type { LayoutChangedMeta } from "../../flex/types";
import { useStableCallback } from "./useStableCallback";

/**
 * Stable wrappers for the `onLayoutChange` and `onLayoutChanged` props (shared by Group and Grid)
 * that only call through when the layout has changed since that callback was last called.
 */
export function useMemoizedLayoutCallbacks<LayoutType>({
  initialLayout,
  layoutsEqual,
  onLayoutChange,
  onLayoutChanged
}: {
  initialLayout: LayoutType;
  layoutsEqual: (a: LayoutType, b: LayoutType) => boolean;
  onLayoutChange: ((layout: LayoutType) => void) | undefined;
  onLayoutChanged:
    | ((layout: LayoutType, meta: LayoutChangedMeta<LayoutType>) => void)
    | undefined;
}) {
  const prevLayoutRef = useRef({
    onLayoutChange: initialLayout,
    onLayoutChanged: initialLayout
  });

  const onLayoutChangeStable = useStableCallback((layout: LayoutType) => {
    if (layoutsEqual(prevLayoutRef.current.onLayoutChange, layout)) {
      return;
    }

    prevLayoutRef.current.onLayoutChange = layout;
    onLayoutChange?.(layout);
  });

  const onLayoutChangedStable = useStableCallback(
    (
      layout: LayoutType,
      isUserInteraction: boolean,
      requestedLayout: LayoutType
    ) => {
      // Only the validated layout is memoized; requested layout changes alone don't trigger the callback
      if (layoutsEqual(prevLayoutRef.current.onLayoutChanged, layout)) {
        return;
      }

      prevLayoutRef.current.onLayoutChanged = layout;
      onLayoutChanged?.(layout, { isUserInteraction, requestedLayout });
    }
  );

  return { onLayoutChangeStable, onLayoutChangedStable };
}

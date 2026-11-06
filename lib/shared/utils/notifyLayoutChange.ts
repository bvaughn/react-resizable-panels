/**
 * Calls a Group's (or Grid's) layout change handlers (see `useMemoizedLayoutCallbacks`);
 * `onLayoutChanged` is only called once the change has completed (e.g. not while the pointer is still being dragged).
 *
 * ℹ️ Either handler may throw; `onLayoutChanged` is still called if `onLayoutChange` throws.
 */
export function notifyLayoutChange<LayoutType>({
  isCompleted,
  isUserInteraction,
  layout,
  onLayoutChange,
  onLayoutChanged,
  requestedLayout
}: {
  isCompleted: boolean;
  isUserInteraction: boolean;
  layout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  onLayoutChanged: (
    layout: LayoutType,
    isUserInteraction: boolean,
    requestedLayout: LayoutType
  ) => void;
  requestedLayout: LayoutType;
}) {
  try {
    onLayoutChange(layout);
  } finally {
    if (isCompleted) {
      onLayoutChanged(layout, isUserInteraction, requestedLayout);
    }
  }
}

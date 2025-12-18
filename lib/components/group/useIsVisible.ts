import { useSyncExternalStore } from "react";

export function useIsVisible(element: HTMLDivElement | null) {
  return useSyncExternalStore(
    (onStoreChange) => {
      element?.addEventListener(
        "contentvisibilityautostatechange",
        onStoreChange
      );
      return () => {
        element?.removeEventListener(
          "contentvisibilityautostatechange",
          onStoreChange
        );
      };
    },
    () =>
      typeof element?.checkVisibility === "function"
        ? element.checkVisibility()
        : true,
    () => true
  );
}

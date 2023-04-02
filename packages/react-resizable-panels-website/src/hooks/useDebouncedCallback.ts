import { useLayoutEffect, useMemo, useRef } from "react";

export default function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  delayMs: number = 100
) {
  // Track latest inline callback function.
  const callbackRef = useRef<(...args: A) => void>(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // Cancel any pending callbacks when unmounting.
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  useLayoutEffect(() => {
    return () => {
      const timeoutId = timeoutIdRef.current;
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const memoizedCallback = useMemo(() => {
    return (...args: any) => {
      const timeoutId = timeoutIdRef.current;
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }

      timeoutIdRef.current = setTimeout(() => {
        const callback = callbackRef.current;
        callback(...args);
      }, delayMs);
    };
  }, [delayMs]);

  return memoizedCallback;
}

import { useLayoutEffect, useMemo, useRef } from "react";

export default function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  delayMs: number = 100
) {
  const callbackRef = useRef<(...args: A) => void>(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const memoizedCallback = useMemo(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: any) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        const callback = callbackRef.current;
        callback(...args);
      }, delayMs);
    };
  }, [delayMs]);

  return memoizedCallback;
}

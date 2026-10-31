import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export function useStableArray<Type>(unstableArray: Type[]): Type[] {
  const ref = useRef<Type[]>([...unstableArray]);

  useIsomorphicLayoutEffect(() => {
    const stableArray = ref.current;
    stableArray.splice(0);
    unstableArray.forEach((current) => {
      stableArray.push(current);
    });
  }, [unstableArray]);

  return ref.current;
}

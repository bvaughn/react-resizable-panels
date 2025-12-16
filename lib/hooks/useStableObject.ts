import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

export function useStableObject<Type extends object>(
  unstableObject: Type
): Type {
  const ref = useRef<Type>({ ...unstableObject });

  useIsomorphicLayoutEffect(() => {
    for (const key in unstableObject) {
      ref.current[key] = unstableObject[key];
    }
  }, [unstableObject]);

  return ref.current;
}

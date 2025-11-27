import { type Ref } from "react";
import { useStableCallback } from "./useStableCallback";

type PossibleRef<Type> = Ref<Type> | undefined;

export function useMergedRefs<Type>(...refs: PossibleRef<Type>[]) {
  return useStableCallback((value: Type | null) => {
    refs.forEach((ref) => {
      if (ref) {
        switch (typeof ref) {
          case "function": {
            ref(value);
            break;
          }
          case "object": {
            ref.current = value;
            break;
          }
        }
      }
    });
  });
}

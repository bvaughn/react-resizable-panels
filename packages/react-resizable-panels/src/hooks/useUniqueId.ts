import { useRef } from "react";
import * as React from "react";

// Support React versions older than 18.0
// Workaround for https://github.com/webpack/webpack/issues/14814
const useId: undefined | (() => string) = (React as any)[
  "useId".toString()
] as () => string;

let counter = 0;

export default function useUniqueId(
  idFromParams: string | null = null
): string {
  const idFromUseId = typeof useId === "function" ? useId() : null;

  const idRef = useRef<string | null>(idFromParams || idFromUseId || null);
  if (idRef.current === null) {
    idRef.current = "" + counter++;
  }

  return idRef.current;
}

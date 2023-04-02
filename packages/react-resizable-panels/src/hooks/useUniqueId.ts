import { useId, useRef } from "react";

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

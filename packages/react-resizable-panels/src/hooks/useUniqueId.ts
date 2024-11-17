import { useId, useRef } from "../vendor/react";

const wrappedUseId: () => string | null =
  typeof useId === "function" ? useId : (): null => null;

let counter = 0;

export default function useUniqueId(
  idFromParams: string | null = null
): string {
  const idFromUseId = wrappedUseId();

  const idRef = useRef<string | null>(idFromParams || idFromUseId || null);
  if (idRef.current === null) {
    idRef.current = "" + counter++;
  }

  return idFromParams ?? idRef.current;
}

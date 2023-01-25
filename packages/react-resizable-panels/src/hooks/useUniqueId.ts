import { useRef } from "react";

let counter = 0;

export default function useUniqueId(
  idFromParams: string | null = null
): string {
  const idRef = useRef<string | null>(idFromParams || null);
  if (idRef.current === null) {
    idRef.current = "" + counter++;
  }

  return idRef.current;
}

import { useRef } from "react";

let counter = 0;

export default function useUniqueId(id: string | null = null): string {
  const idRef = useRef<string | null>(id);
  if (idRef.current === null) {
    idRef.current = "" + counter++;
  }

  return idRef.current;
}

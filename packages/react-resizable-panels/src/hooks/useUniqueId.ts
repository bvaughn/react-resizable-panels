import { useRef } from "react";

let counter = 0;

export default function useUniqueId(): string {
  const idRef = useRef<number | null>(null);
  if (idRef.current === null) {
    idRef.current = counter++;
  }

  return "" + idRef.current;
}

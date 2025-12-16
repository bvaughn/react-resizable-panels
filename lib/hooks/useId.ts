import { useId as useIdReact } from "react";

export function useId(stableId: number | string | undefined) {
  const dynamicId = useIdReact();

  return `${stableId ?? dynamicId}`;
}

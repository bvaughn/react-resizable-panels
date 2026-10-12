import { useId as useIdReact } from "react";
import { isExplicitId } from "../utils/isExplicitId";

export function useId(stableId: number | string | undefined) {
  const dynamicId = useIdReact();

  return isExplicitId(stableId) ? `${stableId}` : dynamicId;
}

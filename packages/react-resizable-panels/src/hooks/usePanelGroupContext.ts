import { useContext } from "react";
import { PanelGroupContext } from "../PanelGroupContext";

export function usePanelGroupContext() {
  const context = useContext(PanelGroupContext);

  return {
    direction: context?.direction,
    groupId: context?.groupId,
  };
}

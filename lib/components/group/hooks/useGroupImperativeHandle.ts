import { useMemo } from "react";
import { MutableGroup } from "../../../state/MutableGroup";
import type { GroupLayout } from "../../../state/types";
import { validateLayoutKeys } from "../../../utils/validateLayoutKeys";
import type { GroupImperativeHandle } from "../types";

export function useGroupImperativeHandle(group: MutableGroup) {
  return useMemo<GroupImperativeHandle>(
    () => ({
      getLayout: () => {
        return group.layout;
      },
      setLayout: (layout: GroupLayout) => {
        if (!validateLayoutKeys(group.panels, layout)) {
          throw new Error(
            `Invalid ${group.panels.length} panel layout keys: ${Object.keys(layout).join(", ")}`
          );
        }

        group.startLayoutTransaction().proposedUpdate(layout).endTransaction();

        return group.layout;
      }
    }),
    [group]
  );
}

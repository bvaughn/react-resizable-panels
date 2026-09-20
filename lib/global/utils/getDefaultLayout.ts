import type { Layout, RegisteredGroup } from "../../components/group/types";
import type { PanelConstraints } from "../../components/panel/types";
import { calculateDefaultLayout } from "./calculateDefaultLayout";
import { validateLayoutKeys } from "./validateLayoutKeys";

export function getDefaultLayout({
  group,
  panelConstraints
}: {
  group: RegisteredGroup;
  panelConstraints: PanelConstraints[];
}): Layout {
  const panelIdsKey = group.panels.map(({ id }) => id).join(",");
  const defaultLayout = group.mutableState.defaultLayout;

  // Dynamic panel configurations can invalidate a supplied default layout.
  return (
    group.mutableState.layouts[panelIdsKey] ??
    (defaultLayout && validateLayoutKeys(group.panels, defaultLayout)
      ? defaultLayout
      : calculateDefaultLayout(panelConstraints))
  );
}

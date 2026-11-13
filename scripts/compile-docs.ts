import { compileDocs } from "react-lib-tools/scripts/compile-docs.ts";

await compileDocs({
  componentNames: [
    "Cell",
    "Grid",
    "Gridline",
    "Group",
    "Panel",
    "Separator",
    "TabCloseButton",
    "TabsetCollapseButton",
    "TabsetDragHandle",
    "TabsetMaximizeButton",
    "Workspace"
  ],
  // Components are organized by area (e.g. lib/flex/components and lib/grid/components)
  componentsPath: ["lib"],
  hookNames: [
    "useDefaultGridLayout",
    "useDefaultLayout",
    "useGridCallbackRef",
    "useGridRef",
    "useGroupCallbackRef",
    "useGroupRef",
    "usePanelCallbackRef",
    "usePanelRef",
    "useParentGrid",
    "useParentGroup",
    "useParentPanel",
    "useParentTab",
    "useParentTabState",
    "useParentTabset",
    "useParentTabsetState",
    "useParentWorkspace",
    "usePopoutWindows",
    "useTabListFreeSpace",
    "useTabListOverflow",
    "useWorkspaceCallbackRef",
    "useWorkspaceRef"
  ],
  imperativeHandleNames: [
    "GridImperativeHandle",
    "GridTrackImperativeHandle",
    "GroupImperativeHandle",
    "PanelImperativeHandle",
    "WorkspaceImperativeHandle"
  ]
});

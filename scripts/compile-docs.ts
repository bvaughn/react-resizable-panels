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
    "Workspace"
  ],
  // Components are organized by area (e.g. lib/flex/components and lib/grid/components)
  componentsPath: ["lib"],
  imperativeHandleNames: [
    "GridImperativeHandle",
    "GridTrackImperativeHandle",
    "GroupImperativeHandle",
    "PanelImperativeHandle",
    "WorkspaceImperativeHandle"
  ]
});

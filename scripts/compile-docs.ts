import { compileDocs } from "react-lib-tools/scripts/compile-docs.ts";

await compileDocs({
  componentNames: [
    "Cell",
    "Grid",
    "GridSeparator",
    "Group",
    "Panel",
    "Separator"
  ],
  imperativeHandleNames: [
    "GridImperativeHandle",
    "GroupImperativeHandle",
    "PanelImperativeHandle"
  ]
});

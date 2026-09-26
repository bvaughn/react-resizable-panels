import { compileDocs } from "react-lib-tools/scripts/compile-docs.ts";

await compileDocs({
  componentNames: ["Cell", "Grid", "Gridline", "Group", "Panel", "Separator"],
  imperativeHandleNames: [
    "GridImperativeHandle",
    "GridTrackImperativeHandle",
    "GroupImperativeHandle",
    "PanelImperativeHandle"
  ]
});

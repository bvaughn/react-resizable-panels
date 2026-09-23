import { compileDocs } from "react-lib-tools/scripts/compile-docs.ts";

await compileDocs({
  componentNames: ["Group", "Panel", "Separator", "Grid", "Cell"],
  imperativeHandleNames: [
    "GroupImperativeHandle",
    "PanelImperativeHandle",
    "GridImperativeHandle"
  ]
});

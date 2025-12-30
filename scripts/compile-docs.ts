import { compileDocs } from "react-lib-tools/scripts/compile-docs.ts";

await compileDocs({
  componentNames: ["Group", "Panel", "Separator"],
  imperativeHandleNames: ["GroupImperativeHandle", "PanelImperativeHandle"]
});

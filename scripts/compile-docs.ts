import { compileDocs } from "react-lib-tools/scripts/compile-docs";

await compileDocs({
  componentNames: ["Group.tsx", "Panel.tsx", "Separator.tsx"],
  imperativeHandleNames: ["GroupImperativeHandle", "PanelImperativeHandle"]
});

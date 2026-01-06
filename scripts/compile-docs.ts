import { NodeSystem } from "@ts-ast-parser/core";
import { compileDocs } from "react-lib-tools/scripts/compile-docs.ts";
import path from "node:path";

class PosixNodeSystem extends NodeSystem {
  normalizePath(filePath: string) {
    const normalized = super.normalizePath(filePath);
    return normalized.split(path.sep).join(path.posix.sep);
  }
}

await compileDocs({
  analyserOptions: {
    system: new PosixNodeSystem()
  },
  componentNames: ["Group", "Panel", "Separator"],
  imperativeHandleNames: ["GroupImperativeHandle", "PanelImperativeHandle"]
});

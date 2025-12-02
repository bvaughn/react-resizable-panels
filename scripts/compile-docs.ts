import { compileComponents } from "./utils/docs/compileComponents.ts";
import { compileImperativeHandles } from "./utils/docs/compileImperativeHandles.ts";

async function run() {
  await compileComponents({
    componentNames: [
      "group/Group.tsx",
      "panel/Panel.tsx",
      "separator/Separator.tsx"
    ],
    outputDirName: "js-docs"
  });

  await compileImperativeHandles({
    names: ["GroupImperativeHandle", "PanelImperativeHandle"],
    outputDirName: "js-docs"
  });
}

run();

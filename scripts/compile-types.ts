import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseDescription } from "react-lib-tools/scripts/utils/docs/parseDescription.ts";
import { syntaxHighlight } from "react-lib-tools/scripts/utils/syntax-highlight.ts";
import ts from "typescript";

// Each model type has its own docs page (under "Imperative API")
const sourcePath = join("lib", "workspace", "types.ts");
const typeNames = ["SplitNode", "TabNode", "TabsetNode", "WorkspaceModel"];
const outputDir = join("public", "generated", "types");

const sourceFile = ts.createSourceFile(
  sourcePath,
  await readFile(sourcePath, "utf8"),
  ts.ScriptTarget.Latest,
  true
);

await mkdir(outputDir, { recursive: true });

for (const name of typeNames) {
  const node = sourceFile.statements.find(
    (statement): statement is ts.TypeAliasDeclaration =>
      ts.isTypeAliasDeclaration(statement) && statement.name.text === name
  );
  if (!node) {
    throw Error(`Type "${name}" not found in ${sourcePath}`);
  }

  const json = {
    description: await parseDescription(getComment(node, name)),
    fields: [] as {
      description: Awaited<ReturnType<typeof parseDescription>>;
      name: string;
      optional: boolean;
      type: string;
    }[],
    // Types without fields (e.g. unions) are shown as code
    html: undefined as string | undefined,
    name
  };

  if (ts.isTypeLiteralNode(node.type)) {
    for (const member of node.type.members) {
      if (ts.isPropertySignature(member) && member.type) {
        const fieldName = member.name.getText();

        json.fields.push({
          description: await parseDescription(
            getComment(member, `${name}.${fieldName}`)
          ),
          name: fieldName,
          optional: !!member.questionToken,
          type: member.type.getText().replace(/\s+/g, " ")
        });
      }
    }
  } else {
    json.html = await syntaxHighlight(node.getText(), "TS");
  }

  const outputFile = join(outputDir, `${name}.json`);

  console.debug("Writing to", outputFile);

  await writeFile(outputFile, JSON.stringify(json, null, 2));
}

function getComment(node: ts.Node, label: string) {
  const comment = ts
    .getJSDocCommentsAndTags(node)
    .find((jsDoc): jsDoc is ts.JSDoc => ts.isJSDoc(jsDoc))?.comment;
  if (!comment) {
    throw Error(`Missing JSDoc comment for ${label}`);
  }

  return ts.getTextOfJSDocComment(comment) ?? "";
}

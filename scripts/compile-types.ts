import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseDescription } from "react-lib-tools/scripts/utils/docs/parseDescription.ts";
import { syntaxHighlight } from "react-lib-tools/scripts/utils/syntax-highlight.ts";
import ts from "typescript";

// Model types each have their own docs page (under "Model");
// the types returned by hooks (e.g. "ParentWorkspace") are documented on the hooks' pages
const sources = [
  {
    path: join("lib", "flex", "types.ts"),
    typeNames: ["ParentGroup", "ParentPanel"]
  },
  {
    path: join("lib", "grid", "types.ts"),
    typeNames: ["ParentGrid"]
  },
  {
    path: join("lib", "workspace", "types.ts"),
    typeNames: [
      "ParentTab",
      "ParentTabset",
      "ParentTabsetState",
      "ParentTabState",
      "ParentWorkspace",
      "PopoutWindow",
      "PopoutWindowRect",
      "PopoutWindows",
      "PopoutWindowState",
      "PopoutWorkspaceProps",
      "SplitNode",
      "TabNode",
      "TabsetNode",
      "UsePopoutWindowsOptions",
      "WorkspaceModel"
    ]
  }
];
const outputDir = join("public", "generated", "types");

await mkdir(outputDir, { recursive: true });

for (const source of sources) {
  const sourceFile = ts.createSourceFile(
    source.path,
    await readFile(source.path, "utf8"),
    ts.ScriptTarget.Latest,
    true
  );

  for (const name of source.typeNames) {
    const node = sourceFile.statements.find(
      (statement): statement is ts.TypeAliasDeclaration =>
        ts.isTypeAliasDeclaration(statement) && statement.name.text === name
    );
    if (!node) {
      throw Error(`Type "${name}" not found in ${source.path}`);
    }

    const json = {
      description: await parseDescription(getComment(node, name)),
      // Types that a type combines with its own fields (e.g. "WorkspaceImperativeHandle" in "ParentWorkspace")
      extends: [] as string[],
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

    // A type literal, or the intersection of other types with one (e.g. `WorkspaceImperativeHandle & { id: string }`)
    const parts: readonly ts.TypeNode[] = ts.isIntersectionTypeNode(node.type)
      ? node.type.types
      : [node.type];
    const literals = parts.filter((part): part is ts.TypeLiteralNode =>
      ts.isTypeLiteralNode(part)
    );
    const references = parts.filter((part): part is ts.TypeReferenceNode =>
      ts.isTypeReferenceNode(part)
    );

    if (
      literals.length > 0 &&
      literals.length + references.length === parts.length
    ) {
      json.extends = references.map((reference) =>
        reference.typeName.getText()
      );

      for (const literal of literals) {
        for (const member of literal.members) {
          if (
            (ts.isPropertySignature(member) || ts.isMethodSignature(member)) &&
            (ts.isPropertySignature(member) ? member.type : true)
          ) {
            const fieldName = member.name.getText();

            json.fields.push({
              description: await parseDescription(
                getComment(member, `${name}.${fieldName}`)
              ),
              name: fieldName,
              optional: !!member.questionToken,
              type: (ts.isPropertySignature(member)
                ? member.type!.getText()
                : `(${member.parameters.map((parameter) => parameter.getText()).join(", ")}) => ${member.type?.getText() ?? "void"}`
              )
                // Types that span several lines are shown on one (e.g. a function's parameters)
                .replace(/\s+/g, " ")
                .replace(/([([{<]) /g, "$1")
                .replace(/ ([)\]}>])/g, "$1")
                .replace(/;\s*([)\]}>])/g, "$1")
            });
          }
        }
      }
    } else {
      json.html = await syntaxHighlight(node.getText(), "TS");
    }

    const outputFile = join(outputDir, `${name}.json`);

    console.debug("Writing to", outputFile);

    await writeFile(outputFile, JSON.stringify(json, null, 2));
  }
}

function getComment(node: ts.Node, label: string) {
  const jsDoc = ts
    .getJSDocCommentsAndTags(node)
    .find((jsDoc): jsDoc is ts.JSDoc => ts.isJSDoc(jsDoc));
  if (!jsDoc?.comment) {
    throw Error(`Missing JSDoc comment for ${label}`);
  }

  let text = ts.getTextOfJSDocComment(jsDoc.comment) ?? "";

  // TypeScript separates @param and @returns tags from the comment; add them back so they're displayed
  // (like react-lib-tools does for imperative handles; see compileImperativeHandle)
  const tags = (jsDoc.tags ?? []).flatMap((tag) => {
    const tagText = ts.getTextOfJSDocComment(tag.comment) ?? "";
    if (ts.isJSDocParameterTag(tag)) {
      return [`@param ${tag.name.getText()} ${tagText}`.trim()];
    } else if (ts.isJSDocReturnTag(tag)) {
      return [`@returns ${tagText}`.trim()];
    }

    return [];
  });
  if (tags.length > 0) {
    text += `\n\n${tags.join("\n")}`;
  }

  return text;
}

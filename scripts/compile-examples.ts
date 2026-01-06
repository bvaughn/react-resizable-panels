import { readFile, writeFile } from "node:fs/promises";
import { basename, join, sep, posix } from "node:path";
import { initialize } from "react-lib-tools/scripts/utils/initialize.ts";
import { trimExcludedText } from "react-lib-tools/scripts/utils/examples/trimExcludedText.ts";
import { syntaxHighlight } from "react-lib-tools/scripts/utils/syntax-highlight.ts";

const toPosixPath = (filePath: string) => filePath.split(sep).join(posix.sep);

const { files, outputDir } = await initialize({
  fileExtensions: [".css", ".html", ".js", ".jsx", ".ts", ".tsx"],
  inputPath: ["src", "routes"],
  outputPath: ["public", "generated", "examples"]
});

for (const file of files) {
  if (!toPosixPath(file).includes("/examples/")) {
    continue;
  }

  const buffer = await readFile(file);

  let rawText = buffer.toString();

  {
    // Remove special comments and directives before syntax highlighting
    rawText = trimExcludedText(rawText);

    rawText = rawText
      .split("\n")
      .filter(
        (line) =>
          !line.includes("prettier-ignore") &&
          !line.includes("eslint-disable-next-line") &&
          !line.includes("@ts-expect-error") &&
          !line.includes("// hidden")
      )
      .join("\n");
  }

  let html;
  if (file.endsWith(".css")) {
    html = await syntaxHighlight(rawText, "CSS");
  } else if (file.endsWith(".html")) {
    html = await syntaxHighlight(rawText, "HTML");
  } else if (file.endsWith(".js") || file.endsWith(".jsx")) {
    html = await syntaxHighlight(rawText, file.endsWith("jsx") ? "JSX" : "JS");
  } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
    html = await syntaxHighlight(rawText, file.endsWith("tsx") ? "TSX" : "TS");
  } else {
    throw Error(`Unsupported file type: ${file}`);
  }

  const fileName = basename(file);

  const outputFile = join(
    outputDir,
    fileName.replace(/(\.example)?\.[\w]+$/, ".json")
  );

  console.debug("Writing to", outputFile);

  await writeFile(outputFile, JSON.stringify({ html }, null, 2));
}

import assert from "node:assert";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { minify } from "terser";
import { ModuleKind, transpileModule } from "typescript";

async function run() {
  const inputPath = join(
    cwd(),
    "lib/components/group/auto-save/restoreSavedLayout.ts"
  );
  const outputPath = join(cwd(), "lib/compiled/restoreSavedLayout.js");

  if (existsSync(outputPath)) {
    rmSync(outputPath);
  }

  const source = readFileSync(inputPath, { encoding: "utf-8" });

  const { outputText: compiledCode } = transpileModule(source, {
    compilerOptions: { module: ModuleKind.Preserve, removeComments: true }
  });

  assert(compiledCode, "Compilation step failed");

  const { code: minifiedCode } = await minify(compiledCode, {
    compress: true,
    sourceMap: false
  });

  assert(minifiedCode, "Minify step failed");

  writeFileSync(outputPath, minifiedCode, { encoding: "utf-8" });
}

run();

import { assert } from "../assert";

export function getStackForPrinting() {
  const error = new Error("");
  assert(error.stack);
  const lines = error.stack.split("\n");
  lines.shift(); // Error name
  lines.shift(); // This function
  const index = lines.findIndex(
    (line) =>
      line.includes("react_stack_bottom_frame") ||
      line.includes("node:internal")
  );
  return lines.slice(0, index).join("\n");
}

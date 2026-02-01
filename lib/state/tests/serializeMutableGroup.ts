import type { MutableGroup } from "../MutableGroup";
import { serializeMutablePanel } from "./serializeMutablePanel";
import { serializeMutableSeparator } from "./serializeMutableSeparator";

export function serializeMutableGroup(
  group: MutableGroup,
  indentation: string
) {
  const strings = [`Group: ${group.id}`];
  group.panels.forEach((panel) => {
    strings.push(serializeMutablePanel(panel, indentation + "  "));
  });
  group.separators.forEach((separator) => {
    strings.push(serializeMutableSeparator(separator, indentation + "  "));
  });
  strings.push("  Layout:");
  Object.keys(group.layout).forEach((key) => {
    strings.push(`    - ${key}: ${group.layout[key]}`);
  });

  return strings.map((line) => `${indentation}${line}`).join("\n");
}

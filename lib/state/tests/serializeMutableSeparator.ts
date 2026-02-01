import type { MutableSeparator } from "../MutableSeparator";

export function serializeMutableSeparator(
  separator: MutableSeparator,
  indentation: string
) {
  const strings = [`Separator: ${separator.id}`];
  strings.push(`  - State: ${separator.state}`);
  strings.push(`  - ARIA: ${JSON.stringify(separator.ariaAttributes)}`);

  return strings.map((line) => `${indentation}${line}`).join("\n");
}

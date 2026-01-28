import type { MutablePanel } from "../MutablePanel";

export function serializeMutablePanel(
  panel: MutablePanel,
  indentation: string
) {
  const strings = [`Panel: ${panel.id || "<NO-ID-PROVIDED>"}`];
  if (panel.collapsible) {
    strings.push(
      `  - Collapsible to ${panel.collapsedSize}${panel.collapsedUnit}`
    );
  }
  if (panel.defaultSize !== undefined) {
    strings.push(`  - Default size ${panel.defaultSize}${panel.defaultUnit}`);
  }
  strings.push(
    `  - Range ${panel.minSize}${panel.minUnit} - ${panel.maxSize}${panel.maxUnit}`
  );
  strings.push(`  - Flex: ${panel.style.flexGrow}%`);

  return strings.map((line) => `${indentation}${line}`).join("\n");
}

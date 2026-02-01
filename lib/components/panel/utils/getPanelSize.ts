import { MutablePanel } from "../../../state/MutablePanel";
import { assert } from "../../../utils/assert";

export function getPanelSize(panel: MutablePanel) {
  const size = panel.group.layout[panel.id];
  assert(size !== undefined, `Size not found for Panel ${panel.id}`);

  return size;
}

import type { Layout } from "../components/group/types";
import { layoutsEqual } from "../global/utils/layoutsEqual";

export function shouldNotifyLayoutChange(layout: Layout, layoutTarget: Layout) {
  return layoutsEqual(layout, layoutTarget);
}

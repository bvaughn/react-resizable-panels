import { Panel } from "./Panel";
import { PanelGroup } from "./PanelGroup";
import { PanelResizeHandle } from "./PanelResizeHandle";
import { assert } from "./utils/assert";
import { getPanelElement } from "./utils/dom/getPanelElement";
import { getPanelElementsForGroup } from "./utils/dom/getPanelElementsForGroup";
import { getPanelGroupElement } from "./utils/dom/getPanelGroupElement";
import { getResizeHandleElement } from "./utils/dom/getResizeHandleElement";
import { getResizeHandleElementIndex } from "./utils/dom/getResizeHandleElementIndex";
import { getResizeHandleElementsForGroup } from "./utils/dom/getResizeHandleElementsForGroup";
import { getResizeHandlePanelIds } from "./utils/dom/getResizeHandlePanelIds";
import { getIntersectingRectangle } from "./utils/rects/getIntersectingRectangle";
import { intersects } from "./utils/rects/intersects";

import type {
  ImperativePanelHandle,
  PanelOnCollapse,
  PanelOnExpand,
  PanelOnResize,
  PanelProps,
} from "./Panel";
import type {
  ImperativePanelGroupHandle,
  PanelGroupOnLayout,
  PanelGroupProps,
  PanelGroupStorage,
} from "./PanelGroup";
import type {
  PanelResizeHandleOnDragging,
  PanelResizeHandleProps,
} from "./PanelResizeHandle";

export {
  // TypeScript types
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  PanelGroupOnLayout,
  PanelGroupProps,
  PanelGroupStorage,
  PanelOnCollapse,
  PanelOnExpand,
  PanelOnResize,
  PanelProps,
  PanelResizeHandleOnDragging,
  PanelResizeHandleProps,

  // React components
  Panel,
  PanelGroup,
  PanelResizeHandle,

  // Utility methods
  assert,
  getIntersectingRectangle,
  intersects,

  // DOM helpers
  getPanelElement,
  getPanelElementsForGroup,
  getPanelGroupElement,
  getResizeHandleElement,
  getResizeHandleElementIndex,
  getResizeHandleElementsForGroup,
  getResizeHandlePanelIds,
};

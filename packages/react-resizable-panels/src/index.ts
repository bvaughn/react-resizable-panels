import { Panel } from "./Panel";
import { PanelGroup } from "./PanelGroup";
import { PanelResizeHandle } from "./PanelResizeHandle";
import { DATA_ATTRIBUTES } from "./constants";
import { usePanelGroupContext } from "./hooks/usePanelGroupContext";
import { assert } from "./utils/assert";
import { setNonce } from "./utils/csp";
import {
  customizeGlobalCursorStyles,
  disableGlobalCursorStyles,
  enableGlobalCursorStyles,
} from "./utils/cursor";
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
import type { PointerHitAreaMargins } from "./PanelResizeHandleRegistry";
import type { CustomCursorStyleConfig } from "./utils/cursor";

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
  PointerHitAreaMargins,

  // React components
  Panel,
  PanelGroup,
  PanelResizeHandle,

  // Hooks
  usePanelGroupContext,

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

  // Styles and CSP (see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)
  setNonce,

  // Global cursor configuration
  customizeGlobalCursorStyles,
  disableGlobalCursorStyles,
  enableGlobalCursorStyles,
  CustomCursorStyleConfig,

  // Data attributes (primarily intended for e2e testing)
  DATA_ATTRIBUTES,
};

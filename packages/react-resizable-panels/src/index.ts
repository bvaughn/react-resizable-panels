import { Panel } from "./Panel";
import { PanelGroup } from "./PanelGroup";
import { PanelResizeHandle } from "./PanelResizeHandle";

// TEMP
import { Panel as new_Panel } from "./new/Panel";
import { PanelGroup as new_PanelGroup } from "./new/PanelGroup";
import { PanelResizeHandle as new_PanelResizeHandle } from "./new/PanelResizeHandle";

import type { ImperativePanelHandle, PanelProps } from "./Panel";
import type { ImperativePanelGroupHandle, PanelGroupProps } from "./PanelGroup";
import type { PanelResizeHandleProps } from "./PanelResizeHandle";
import { getAvailableGroupSizePixels } from "./utils/group";
import type {
  PanelGroupOnLayout,
  PanelGroupStorage,
  PanelOnCollapse,
  PanelOnResize,
  PanelResizeHandleOnDragging,
  Units,
} from "./types";

export {
  // TypeScript types
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  PanelOnCollapse,
  PanelOnResize,
  PanelGroupOnLayout,
  PanelGroupProps,
  PanelGroupStorage,
  PanelProps,
  PanelResizeHandleOnDragging,
  PanelResizeHandleProps,
  Units,

  // React components
  Panel,
  PanelGroup,
  PanelResizeHandle,

  // Utility methods
  getAvailableGroupSizePixels,

  // TEMP
  new_Panel,
  new_PanelGroup,
  new_PanelResizeHandle,
};

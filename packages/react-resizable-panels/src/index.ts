import { Panel } from "./Panel";
import { PanelGroup } from "./PanelGroup";
import { PanelResizeHandle } from "./PanelResizeHandle";

// TEMP
import type { MixedSizes } from "./new/types";
import { Panel as new_Panel } from "./new/Panel";
import type { ImperativePanelHandle as new_ImperativePanelHandle } from "./new/Panel";
import { PanelGroup as new_PanelGroup } from "./new/PanelGroup";
import type { ImperativePanelGroupHandle as new_ImperativePanelGroupHandle } from "./new/PanelGroup";
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
  MixedSizes,
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
  new_ImperativePanelGroupHandle,
  new_ImperativePanelHandle,
  new_Panel,
  new_PanelGroup,
  new_PanelResizeHandle,
};

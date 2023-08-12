import { CSSProperties, createContext } from "./vendor/react";

import { PanelData, ResizeEvent, ResizeHandler, Units } from "./types";

export const PanelGroupContext = createContext<{
  activeHandleId: string | null;
  collapsePanel: (id: string) => void;
  direction: "horizontal" | "vertical";
  expandPanel: (id: string) => void;
  getPanelSize: (id: string, units?: Units) => number;
  getPanelStyle: (id: string, defaultSize: number | null) => CSSProperties;
  groupId: string;
  registerPanel: (id: string, panel: PanelData) => void;
  registerResizeHandle: (id: string) => ResizeHandler;
  resizePanel: (id: string, percentage: number, units?: Units) => void;
  startDragging: (id: string, event: ResizeEvent) => void;
  stopDragging: () => void;
  unregisterPanel: (id: string) => void;
  units: Units;
} | null>(null);

PanelGroupContext.displayName = "PanelGroupContext";

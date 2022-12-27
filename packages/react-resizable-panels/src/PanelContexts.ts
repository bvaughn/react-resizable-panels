import { CSSProperties, createContext } from "react";

import { PanelData, ResizeEvent, ResizeHandler } from "./types";

export const PanelGroupContext = createContext<{
  activeHandleId: string | null;
  direction: "horizontal" | "vertical";
  getPanelStyle: (id: string) => CSSProperties;
  groupId: string;
  registerPanel: (id: string, panel: PanelData) => void;
  registerResizeHandle: (id: string) => ResizeHandler;
  startDragging: (id: string, event: ResizeEvent) => void;
  stopDragging: () => void;
  unregisterPanel: (id: string) => void;
} | null>(null);

import { CSSProperties, createContext } from "react";

import { PanelData, ResizeHandler } from "./types";

export const PanelContext = createContext<{
  activeHandleId: string | null;
} | null>(null);

export const PanelGroupContext = createContext<{
  direction: "horizontal" | "vertical";
  getPanelStyle: (id: string) => CSSProperties;
  groupId: string;
  registerPanel: (id: string, panel: PanelData) => void;
  registerResizeHandle: (id: string) => ResizeHandler;
  startDragging: (id: string) => void;
  stopDragging: () => void;
  unregisterPanel: (id: string) => void;
} | null>(null);

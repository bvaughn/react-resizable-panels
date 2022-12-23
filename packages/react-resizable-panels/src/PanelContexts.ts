import { CSSProperties, createContext } from "react";

import { PanelData, ResizeHandler } from "./types";

export const PanelGroupContext = createContext<{
  direction: "horizontal" | "vertical";
  getPanelStyle: (id: string) => CSSProperties;
  registerPanel: (id: string, panel: PanelData) => void;
  registerResizeHandle: (idBefore: string, idAfter: string) => ResizeHandler;
  unregisterPanel: (id: string) => void;
} | null>(null);

import { CSSProperties, createContext } from "react";

import { PanelData, ResizeEvent, ResizeHandler } from "./types";

export const PanelGroupContext = createContext<{
  activeHandleId: string | null;
  collapsePanel: (id: string) => void;
  direction: "horizontal" | "vertical";
  expandPanel: (id: string) => void;
  getPanelStyle: (id: string) => CSSProperties;
  groupId: string;
  registerPanel: (id: string, panel: PanelData) => void;
  registerResizeHandle: (id: string) => ResizeHandler;
  resizePanel: (id: string, percentage: number) => void;
  startDragging: (id: string, event: ResizeEvent) => void;
  stopDragging: () => void;
  unregisterPanel: (id: string) => void;
} | null>(null);

// Workaround for Parcel scope hoisting (which renames objects/functions).
// Casting to :any is required to avoid corrupting the generated TypeScript types.
// See github.com/parcel-bundler/parcel/issues/8724
(PanelGroupContext as any).displayName = "PanelGroupContext";

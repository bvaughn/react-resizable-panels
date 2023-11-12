import { PanelData } from "./Panel";
import { MixedSizes } from "./types";
import { CSSProperties, createContext } from "./vendor/react";

export type ResizeEvent = KeyboardEvent | MouseEvent | TouchEvent;
export type ResizeHandler = (event: ResizeEvent) => void;

export type DragState = {
  dragHandleId: string;
  dragHandleRect: DOMRect;
  initialCursorPosition: number;
  initialLayout: number[];
};

export const PanelGroupContext = createContext<{
  collapsePanel: (panelData: PanelData) => void;
  direction: "horizontal" | "vertical";
  dragState: DragState | null;
  expandPanel: (panelData: PanelData) => void;
  getPanelSize: (panelData: PanelData) => MixedSizes;
  getPanelStyle: (panelData: PanelData) => CSSProperties;
  groupId: string;
  isPanelCollapsed: (panelData: PanelData) => boolean;
  isPanelExpanded: (panelData: PanelData) => boolean;
  registerPanel: (panelData: PanelData) => void;
  registerResizeHandle: (dragHandleId: string) => ResizeHandler;
  resizePanel: (panelData: PanelData, mixedSizes: Partial<MixedSizes>) => void;
  startDragging: (dragHandleId: string, event: ResizeEvent) => void;
  stopDragging: () => void;
  unregisterPanel: (panelData: PanelData) => void;
} | null>(null);

PanelGroupContext.displayName = "PanelGroupContext";

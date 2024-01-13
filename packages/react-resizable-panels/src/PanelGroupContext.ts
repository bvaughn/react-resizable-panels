import { PanelConstraints, PanelData } from "./Panel";
import { CSSProperties, createContext } from "./vendor/react";

export type ResizeEvent = KeyboardEvent | MouseEvent | TouchEvent;
export type ResizeHandler = (event: ResizeEvent) => void;

export type DragState = {
  dragHandleId: string;
  dragHandleRect: DOMRect;
  initialCursorPosition: number;
  initialLayout: number[];
};

export type TPanelGroupContext = {
  collapsePanel: (panelData: PanelData) => void;
  direction: "horizontal" | "vertical";
  dragState: DragState | null;
  expandPanel: (panelData: PanelData) => void;
  getPanelSize: (panelData: PanelData) => number;
  getPanelStyle: (
    panelData: PanelData,
    defaultSize: number | undefined
  ) => CSSProperties;
  groupId: string;
  isPanelCollapsed: (panelData: PanelData) => boolean;
  isPanelExpanded: (panelData: PanelData) => boolean;
  reevaluatePanelConstraints: (
    panelData: PanelData,
    prevConstraints: PanelConstraints
  ) => void;
  registerPanel: (panelData: PanelData) => void;
  registerResizeHandle: (dragHandleId: string) => ResizeHandler;
  resizePanel: (panelData: PanelData, size: number) => void;
  startDragging: (dragHandleId: string, event: ResizeEvent) => void;
  stopDragging: () => void;
  unregisterPanel: (panelData: PanelData) => void;
  panelGroupElement: ParentNode | null;
};
export const PanelGroupContext = createContext<TPanelGroupContext | null>(null);

PanelGroupContext.displayName = "PanelGroupContext";

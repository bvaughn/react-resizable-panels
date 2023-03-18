export type PanelCollapseLogEntryType = "onCollapse";
export type PanelGroupLayoutLogEntryType = "onLayout";
export type PanelResizeHandleDraggingLogEntryType = "onDragging";
export type PanelResizeLogEntryType = "onResize";

export type PanelCollapseLogEntry = {
  collapsed: boolean;
  panelId: string;
  type: PanelCollapseLogEntryType;
};
export type PanelResizeHandleDraggingLogEntry = {
  isDragging: boolean;
  resizeHandleId: string;
  type: PanelResizeHandleDraggingLogEntryType;
};
export type PanelGroupLayoutLogEntry = {
  groupId: string;
  sizes: number[];
  type: PanelGroupLayoutLogEntryType;
};
export type PanelResizeLogEntry = {
  panelId: string;
  size: number;
  type: PanelResizeLogEntryType;
};

export type LogEntryType =
  | PanelCollapseLogEntryType
  | PanelResizeHandleDraggingLogEntryType
  | PanelGroupLayoutLogEntryType
  | PanelResizeLogEntryType;

export type LogEntry =
  | PanelCollapseLogEntry
  | PanelResizeHandleDraggingLogEntry
  | PanelGroupLayoutLogEntry
  | PanelResizeLogEntry;

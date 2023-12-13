export type PanelCollapseLogEntryType = "onCollapse";
export type PanelExpandLogEntryType = "onExpand";
export type PanelGroupLayoutLogEntryType = "onLayout";
export type PanelResizeHandleDraggingLogEntryType = "onDragging";
export type PanelResizeLogEntryType = "onResize";

export type PanelCollapseLogEntry = {
  panelId: string;
  type: PanelCollapseLogEntryType;
};
export type PanelExpandLogEntry = {
  panelId: string;
  type: PanelExpandLogEntryType;
};
export type PanelResizeHandleDraggingLogEntry = {
  isDragging: boolean;
  resizeHandleId: string;
  type: PanelResizeHandleDraggingLogEntryType;
};
export type PanelGroupLayoutLogEntry = {
  groupId: string;
  layout: number[];
  type: PanelGroupLayoutLogEntryType;
};
export type PanelResizeLogEntry = {
  panelId: string;
  size: number;
  type: PanelResizeLogEntryType;
};

export type LogEntryType =
  | PanelCollapseLogEntryType
  | PanelExpandLogEntryType
  | PanelResizeHandleDraggingLogEntryType
  | PanelGroupLayoutLogEntryType
  | PanelResizeLogEntryType;

export type LogEntry =
  | PanelCollapseLogEntry
  | PanelExpandLogEntry
  | PanelResizeHandleDraggingLogEntry
  | PanelGroupLayoutLogEntry
  | PanelResizeLogEntry;

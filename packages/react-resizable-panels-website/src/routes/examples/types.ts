export type PanelCollapseLogEntryType = "onCollapse";
export type PanelGroupLayoutLogEntryType = "onLayout";
export type PanelResizeLogEntryType = "onResize";

export type PanelCollapseLogEntry = {
  collapsed: boolean;
  panelId: string;
  type: PanelCollapseLogEntryType;
};
export type PanelGroupLayoutLogEntry = {
  type: PanelGroupLayoutLogEntryType;
  sizes: number[];
};
export type PanelResizeLogEntry = {
  panelId: string;
  type: PanelResizeLogEntryType;
  size: number;
};

export type LogEntryType =
  | PanelCollapseLogEntryType
  | PanelGroupLayoutLogEntryType
  | PanelResizeLogEntryType;

export type LogEntry =
  | PanelCollapseLogEntry
  | PanelGroupLayoutLogEntry
  | PanelResizeLogEntry;

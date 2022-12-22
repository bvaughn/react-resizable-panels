export type Direction = "horizontal" | "vertical";

export type PanelId = string;

export type Panel = {
  defaultSize: number;
  id: PanelId;
  minSize: number;
};

export type ResizeHandler = (event: MouseEvent) => void;

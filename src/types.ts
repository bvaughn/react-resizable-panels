export type Direction = "horizontal" | "vertical";

export type PanelId = string;

export type PanelData = {
  defaultSize: number;
  id: PanelId;
  minSize: number;
};

export type ResizeHandler = (event: MouseEvent) => void;

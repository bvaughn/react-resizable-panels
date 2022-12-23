export type Direction = "horizontal" | "vertical";

export type PanelData = {
  defaultSize: number;
  id: string;
  minSize: number;
};

export type ResizeHandler = (event: MouseEvent) => void;

export type Direction = "horizontal" | "vertical";

export type PanelData = {
  defaultSize: number;
  id: string;
  minSize: number;
  order: number | null;
};

export type ResizeEvent = MouseEvent | TouchEvent;
export type ResizeHandler = (event: ResizeEvent) => void;

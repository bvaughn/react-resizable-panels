export type Direction = "horizontal" | "vertical";

export type PanelData = {
  defaultSize: number;
  id: string;
  minSize: number;
  order: number | null;
};

export type ResizeEvent = MouseEvent | TouchEvent;
export type DragCoordinates = { prevX: number, prevY: number };
export type ResizeHandler = (event: ResizeEvent) => void;

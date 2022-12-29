export type Direction = "horizontal" | "vertical";

export type PanelData = {
  defaultSize: number;
  id: string;
  maxSize: number;
  minSize: number;
  order: number | null;
};

export type ResizeEvent = KeyboardEvent | MouseEvent | TouchEvent;
export type ResizeHandler = (event: ResizeEvent) => void;

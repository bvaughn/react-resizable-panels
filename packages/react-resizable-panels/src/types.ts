import { RefObject } from "react";

export type Direction = "horizontal" | "vertical";

export type PanelOnResize = (size: number) => void;

export type PanelData = {
  defaultSize: number;
  id: string;
  maxSize: number;
  minSize: number;
  onResizeRef: RefObject<PanelOnResize | null>;
  order: number | null;
};

export type ResizeEvent = KeyboardEvent | MouseEvent | TouchEvent;
export type ResizeHandler = (event: ResizeEvent) => void;

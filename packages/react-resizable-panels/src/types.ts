export type Direction = "horizontal" | "vertical";

export type MixedSizes = {
  sizePercentage: number;
  sizePixels: number;
};

export type ResizeEvent = KeyboardEvent | MouseEvent | TouchEvent;
export type ResizeHandler = (event: ResizeEvent) => void;

export type DataAttributes = {
  [attribute: string]: string | number | boolean | undefined;
};

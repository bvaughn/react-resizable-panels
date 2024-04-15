export type Direction = "horizontal" | "vertical";

// The "contextmenu" event is not supported as a PointerEvent in all browsers yet, so MouseEvent still need to be handled
export type ResizeEvent = KeyboardEvent | PointerEvent | MouseEvent;
export type ResizeHandler = (event: ResizeEvent) => void;

import { ResizeEvent } from "../../PanelGroupContext";

export function isKeyDown(event: ResizeEvent): event is KeyboardEvent {
  return event.type === "keydown";
}

export function isPointerEvent(event: ResizeEvent): event is PointerEvent {
  return event.type.startsWith("pointer");
}

export function isMouseEvent(event: ResizeEvent): event is MouseEvent {
  return event.type.startsWith("mouse");
}

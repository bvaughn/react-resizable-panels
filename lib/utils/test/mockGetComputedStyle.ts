import { EventEmitter } from "stream";

const elementToStyle = new Map<Element, CSSStyleDeclaration>();

let defaultStyle: CSSStyleDeclaration | undefined = undefined;

export const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export function mockGetComputedStyle() {
  const originalGetComputedStyle = window.getComputedStyle;

  window.getComputedStyle = function getComputedStyle(element: Element) {
    return (
      elementToStyle.get(element) ??
      defaultStyle ??
      originalGetComputedStyle(element)
    );
  };

  return () => {
    window.getComputedStyle = originalGetComputedStyle;
  };
}

export function setDefaultElementStyle(style: CSSStyleDeclaration) {
  defaultStyle = style;

  emitter.emit("change");
}

export function setElementStyle(element: Element, style: CSSStyleDeclaration) {
  elementToStyle.set(element, style);

  emitter.emit("change", element);
}

import { EventEmitter } from "stream";

const elementToStyle = new Map<Element, CSSStyleDeclaration>();

const originalGetComputedStyle = window.getComputedStyle;

let defaultStyle: CSSStyleDeclaration | undefined = undefined;

const emptyStyle = {} as CSSStyleDeclaration;

export const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export function mockGetComputedStyle() {
  window.getComputedStyle = function getComputedStyle(element: Element) {
    return new Proxy(emptyStyle, {
      get(_, name) {
        const key = name as keyof CSSStyleDeclaration;

        const mockedStyle =
          elementToStyle.get(element) ?? defaultStyle ?? emptyStyle;

        const actualStyle = originalGetComputedStyle(element);

        return name in mockedStyle ? mockedStyle[key] : actualStyle[key];
      }
    });
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

export function unmockGetComputedStyle() {
  window.getComputedStyle = originalGetComputedStyle;
}

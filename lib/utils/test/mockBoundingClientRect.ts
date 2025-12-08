import EventEmitter from "node:events";

type GetDOMRect = (element: HTMLElement) => DOMRectReadOnly | undefined | void;

export const emitter = new EventEmitter();
emitter.setMaxListeners(100);

const elementToDOMRect = new Map<HTMLElement, DOMRect>();

let defaultDomRect: DOMRectReadOnly = new DOMRect(0, 0, 0, 0);
let getDOMRect: GetDOMRect | undefined = undefined;

function defaultGetDOMRect(element: Element) {
  const idString =
    element.getAttribute("data-group") ||
    element.getAttribute("data-panel") ||
    element.getAttribute("data-separator") ||
    element.getAttribute("data-testid") ||
    "";
  if (idString) {
    const match = idString.match(/(\d+),(\d+) (\d+)x(\d+)/);
    if (match) {
      const [_, x, y, width, height] = match;

      return new DOMRect(
        parseInt(x),
        parseInt(y),
        parseInt(width),
        parseInt(height)
      );
    }
  }
}

export function setDefaultElementBounds(rect: DOMRect) {
  defaultDomRect = rect;

  emitter.emit("change");
}

export function setElementBoundsFunction(value: GetDOMRect) {
  getDOMRect = value;

  emitter.emit("change");
}

export function setElementBounds(element: HTMLElement, rect: DOMRect) {
  elementToDOMRect.set(element, rect);

  Object.defineProperty(element, "clientHeight", {
    configurable: true,
    value: rect.height
  });
  Object.defineProperty(element, "clientWidth", {
    configurable: true,
    value: rect.width
  });
  Object.defineProperty(element, "offsetHeight", {
    configurable: true,
    value: rect.height
  });
  Object.defineProperty(element, "offsetLeft", {
    configurable: true,
    value: rect.left
  });
  Object.defineProperty(element, "offsetTop", {
    configurable: true,
    value: rect.top
  });
  Object.defineProperty(element, "offsetWidth", {
    configurable: true,
    value: rect.width
  });

  emitter.emit("change", element);
}

export function mockBoundingClientRect() {
  const originalGetBoundingClientRect =
    HTMLElement.prototype.getBoundingClientRect;

  HTMLElement.prototype.getBoundingClientRect =
    function getBoundingClientRect() {
      if (getDOMRect) {
        const rectOverride = getDOMRect(this);
        if (rectOverride) {
          return rectOverride;
        }
      }

      return (
        elementToDOMRect.get(this) || defaultGetDOMRect(this) || defaultDomRect
      );
    };

  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: function () {
      return (this as HTMLElement).getBoundingClientRect().height;
    }
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: function () {
      return (this as HTMLElement).getBoundingClientRect().width;
    }
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    get: function () {
      return (this as HTMLElement).getBoundingClientRect().height;
    }
  });
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
    configurable: true,
    get: function () {
      return (this as HTMLElement).getBoundingClientRect().left;
    }
  });
  Object.defineProperty(HTMLElement.prototype, "offsetTop", {
    configurable: true,
    get: function () {
      return (this as HTMLElement).getBoundingClientRect().top;
    }
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get: function () {
      return (this as HTMLElement).getBoundingClientRect().width;
    }
  });

  return function unmockBoundingClientRect() {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;

    defaultDomRect = new DOMRect(0, 0, 0, 0);
    getDOMRect = undefined;

    elementToDOMRect.clear();
  };
}

import { emitter } from "./mockBoundingClientRect";

let disabled: boolean = false;

export function disableResizeObserverForCurrentTest() {
  disabled = true;
}

export function simulateUnsupportedEnvironmentForTest() {
  // @ts-expect-error Simulate API being unsupported
  window.ResizeObserver = null;
}

export function mockResizeObserver() {
  disabled = false;

  const originalResizeObserver = window.ResizeObserver;

  window.ResizeObserver = MockResizeObserver;

  return function unmockResizeObserver() {
    window.ResizeObserver = originalResizeObserver;

    disabled = false;
  };
}

class MockResizeObserver implements ResizeObserver {
  readonly #callback: ResizeObserverCallback;
  #disconnected: boolean = false;
  #elements: Set<HTMLElement> = new Set();

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;

    emitter.addListener("change", this.#onChange);
  }

  observe(element: HTMLElement) {
    if (this.#disconnected) {
      return;
    }

    this.#elements.add(element);
    this.#notify([element]);
  }

  unobserve(element: HTMLElement) {
    this.#elements.delete(element);
  }

  disconnect() {
    this.#disconnected = true;
    this.#elements.clear();

    emitter.removeListener("change", this.#onChange);
  }

  #notify(elements: HTMLElement[]) {
    if (disabled) {
      return;
    }

    const entries = elements.map((element) => {
      const computedStyle = window.getComputedStyle(element);
      const writingMode = computedStyle.writingMode;

      const contentRect = element.getBoundingClientRect();

      let blockSize = 0;
      let inlineSize = 0;
      if (writingMode.includes("vertical")) {
        blockSize = contentRect.width;
        inlineSize = contentRect.height;
      } else {
        blockSize = contentRect.height;
        inlineSize = contentRect.width;
      }

      return {
        borderBoxSize: [
          {
            blockSize,
            inlineSize
          }
        ],
        contentBoxSize: [],
        contentRect,
        devicePixelContentBoxSize: [],
        target: element
      };
    });

    this.#callback(entries, this);
  }

  #onChange = (target?: HTMLElement) => {
    if (target) {
      if (this.#elements.has(target)) {
        this.#notify([target]);
      }
    } else {
      this.#notify(Array.from(this.#elements));
    }
  };
}

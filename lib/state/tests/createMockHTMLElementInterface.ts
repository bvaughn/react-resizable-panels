import { vi } from "vitest";
import { Rect } from "../../types";
import { EventEmitter, type EventListener } from "../../utils/EventEmitter";
import type { HTMLElementInterface } from "../types";

export class MockHTMLElementInterface
  extends EventEmitter<{ resize: Rect }>
  implements HTMLElementInterface
{
  rect: Rect;

  constructor({
    height = 0,
    width = 0,
    x = 0,
    y = 0
  }: {
    height?: number;
    width?: number;
    x?: number;
    y?: number;
  } = {}) {
    super();

    this.rect = new DOMRect(x, y, width, height);
  }

  getElementRect = vi.fn().mockImplementation(() => {
    return this.rect;
  });

  onResize(listener: EventListener<Rect>): () => void {
    return this.addListener("resize", listener);
  }

  resizeForTest(rect: Partial<Rect>) {
    this.rect = Rect.merge(this.rect, rect);

    this.emit("resize", this.rect);
  }
}

export function createMockHTMLElementInterface(
  defaultRect: {
    height?: number;
    width?: number;
    x?: number;
    y?: number;
  } = {}
): MockHTMLElementInterface {
  return new MockHTMLElementInterface(defaultRect);
}

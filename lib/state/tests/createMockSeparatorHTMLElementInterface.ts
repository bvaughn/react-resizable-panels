import { vi } from "vitest";
import type { SeparatorHTMLElementInterface } from "../types";
import { MockHTMLElementInterface } from "./createMockHTMLElementInterface";

export class MockSeparatorHTMLElementInterface
  extends MockHTMLElementInterface
  implements SeparatorHTMLElementInterface
{
  focus = vi.fn();
}

export function createMockSeparatorHTMLElementInterface(
  defaultRect: {
    height?: number;
    width?: number;
    x?: number;
    y?: number;
  } = {}
): MockSeparatorHTMLElementInterface {
  return new MockSeparatorHTMLElementInterface(defaultRect);
}

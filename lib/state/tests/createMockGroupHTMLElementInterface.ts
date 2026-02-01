import { vi } from "vitest";
import type { GroupHTMLElementInterface } from "../types";
import { MockHTMLElementInterface } from "./createMockHTMLElementInterface";

export class MockGroupHTMLElementInterface
  extends MockHTMLElementInterface
  implements GroupHTMLElementInterface
{
  getChildren = vi.fn().mockReturnValue([]);
}

export function createMockGroupHTMLElementInterface(
  defaultRect: {
    height?: number;
    width?: number;
    x?: number;
    y?: number;
  } = {}
): MockGroupHTMLElementInterface {
  return new MockGroupHTMLElementInterface(defaultRect);
}

import { vi } from "vitest";
import type { PanelHTMLElementInterface } from "../types";
import { MockHTMLElementInterface } from "./createMockHTMLElementInterface";

export class MockPanelHTMLElementInterface
  extends MockHTMLElementInterface
  implements PanelHTMLElementInterface
{
  getElementFontSize = vi.fn().mockReturnValue(12);
  getRootFontSize = vi.fn().mockReturnValue(16);
  getWindowSize = vi.fn().mockReturnValue({
    innerHeight: 800,
    innerWidth: 600
  });
}

export function createMockPanelHTMLElementInterface(
  defaultRect: {
    height?: number;
    width?: number;
    x?: number;
    y?: number;
  } = {}
): MockPanelHTMLElementInterface {
  return new MockPanelHTMLElementInterface(defaultRect);
}

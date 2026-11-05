import { describe, expect, test } from "vitest";
import { findTabsetPanels } from "./findTabsetPanels";

describe("findTabsetPanels", () => {
  test("skips tabsets of workspaces rendered within tabs", () => {
    const rootElement = document.createElement("div");
    rootElement.setAttribute("data-workspace", "");
    rootElement.innerHTML = `
      <div data-tabset-id="left">
        <div data-tab-panels>
          <div data-workspace>
            <div data-tabset-id="right">
              <div data-tab-panels id="nested"></div>
            </div>
          </div>
        </div>
      </div>
      <div data-tabset-id="right">
        <div data-tab-panels id="own"></div>
      </div>
    `;

    expect(findTabsetPanels(rootElement, "right")?.id).toBe("own");
    expect(findTabsetPanels(rootElement, "missing")).toBeUndefined();
  });
});

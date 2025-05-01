import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { act } from "react-dom/test-utils";
import { Panel } from "./Panel";
import { PanelGroup } from "./PanelGroup";
import { PanelResizeHandle } from "./PanelResizeHandle";

describe("PanelGroup", () => {
  let expectedWarnings: string[] = [];

  function expectWarning(expectedMessage: string) {
    expectedWarnings.push(expectedMessage);
  }

  beforeEach(() => {
    // @ts-expect-error
    global.IS_REACT_ACT_ENVIRONMENT = true;

    expectedWarnings = [];

    vi.spyOn(console, "warn").mockImplementation((actualMessage: string) => {
      const match = expectedWarnings.findIndex((expectedMessage) => {
        return actualMessage.includes(expectedMessage);
      });

      if (match >= 0) {
        expectedWarnings.splice(match, 1);
        return;
      }

      throw Error(`Unexpected warning: ${actualMessage}`);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    expect(expectedWarnings).toHaveLength(0);
  });

  describe("DEV warnings", () => {
    test("should warn about server rendered panels with no default size", () => {
      act(() => {
        // No warning expected if default sizes provided
        renderToStaticMarkup(
          <PanelGroup direction="horizontal">
            <Panel defaultSize={100} />
            <PanelResizeHandle />
            <Panel defaultSize={1_000} />
          </PanelGroup>
        );
      });

      expectWarning(
        "Panel defaultSize prop recommended to avoid layout shift after server rendering"
      );

      act(() => {
        renderToStaticMarkup(
          <PanelGroup direction="horizontal">
            <Panel id="one" />
          </PanelGroup>
        );
      });
    });
  });
});

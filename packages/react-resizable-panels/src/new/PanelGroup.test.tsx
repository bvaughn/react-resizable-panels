import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { Panel } from "./Panel";
import { PanelGroup } from "./PanelGroup";

describe("PanelGroup", () => {
  let expectedWarnings: string[] = [];
  let root: Root;

  function expectWarning(expectedMessage: string) {
    expectedWarnings.push(expectedMessage);
  }

  beforeEach(() => {
    // @ts-expect-error
    global.IS_REACT_ACT_ENVIRONMENT = true;

    expectedWarnings = [];
    root = createRoot(document.createElement("div"));

    jest.spyOn(console, "warn").mockImplementation((actualMessage: string) => {
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
    expect(expectedWarnings).toHaveLength(0);

    jest.clearAllMocks();
    jest.resetModules();

    act(() => {
      root.unmount();
    });
  });

  describe("DEV warnings", () => {
    it("should warn about unstable layouts without id and order props", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel defaultSizePercentage={100} id="a" />
          </PanelGroup>
        );
      });

      expectWarning(
        "Panel id and order props recommended when panels are dynamically rendered"
      );

      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel defaultSizePercentage={50} id="a" />
            <Panel defaultSizePercentage={50} id="b" />
          </PanelGroup>
        );
      });
    });

    it("should warn about server rendered panels with no default size", () => {
      jest.resetModules();
      jest.mock("#is-browser", () => ({ isBrowser: false }));

      const { createRoot } = require("react-dom/client");
      const { act } = require("react-dom/test-utils");
      const Panel = require("./Panel").Panel;
      const PanelGroup = require("./PanelGroup").PanelGroup;

      expectWarning(
        "Panel defaultSizePercentage or defaultSizePixels prop recommended to avoid layout shift after server rendering"
      );

      act(() => {
        const root = createRoot(document.createElement("div"));
        root.render(
          <PanelGroup direction="horizontal">
            <Panel />
          </PanelGroup>
        );
      });
    });
  });
});

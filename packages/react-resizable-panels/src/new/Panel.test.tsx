import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { createRef } from "../vendor/react";
import { ImperativePanelHandle, Panel } from "./Panel";
import { PanelGroup } from "./PanelGroup";
import { mockOffsetWidthAndHeight } from "./utils/test-utils";
import { MixedSizes } from "..";

describe("PanelGroup", () => {
  let expectedWarnings: string[] = [];
  let root: Root;
  let uninstallMockOffsetWidthAndHeight: () => void;

  function expectWarning(expectedMessage: string) {
    expectedWarnings.push(expectedMessage);
  }

  beforeEach(() => {
    // @ts-expect-error
    global.IS_REACT_ACT_ENVIRONMENT = true;

    uninstallMockOffsetWidthAndHeight = mockOffsetWidthAndHeight();

    const container = document.createElement("div");
    document.body.appendChild(container);

    expectedWarnings = [];
    root = createRoot(container);

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
    uninstallMockOffsetWidthAndHeight();

    jest.clearAllMocks();
    jest.resetModules();

    act(() => {
      root.unmount();
    });

    expect(expectedWarnings).toHaveLength(0);
  });

  describe("imperative handle API", () => {
    it("should re-expand to the most recent size before collapsing", () => {
      const ref = createRef<ImperativePanelHandle>();

      let mostRecentMixedSizes: MixedSizes | undefined;

      const onResize = (mixedSizes: MixedSizes) => {
        mostRecentMixedSizes = mixedSizes;
      };

      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel
              collapsible
              collapsedSizePercentage={5}
              defaultSizePercentage={50}
              id="a"
              onResize={onResize}
              ref={ref}
            />
            <Panel defaultSizePercentage={50} id="b" />
          </PanelGroup>
        );
      });

      expect(mostRecentMixedSizes).toEqual({
        sizePercentage: 50,
        sizePixels: 500,
      });

      act(() => {
        ref.current!.resize({ sizePercentage: 30 });
      });

      expect(mostRecentMixedSizes).toEqual({
        sizePercentage: 30,
        sizePixels: 300,
      });

      act(() => {
        ref.current!.collapse();
      });

      expect(mostRecentMixedSizes).toEqual({
        sizePercentage: 5,
        sizePixels: 50,
      });

      act(() => {
        ref.current!.expand();
      });

      expect(mostRecentMixedSizes).toEqual({
        sizePercentage: 30,
        sizePixels: 300,
      });
    });
  });

  describe("DEV warnings", () => {
    it("should warn about server rendered panels with no default size", () => {
      jest.resetModules();
      jest.mock("#is-browser", () => ({ isBrowser: false }));

      const { createRoot } = require("react-dom/client");
      const { act } = require("react-dom/test-utils");
      const Panel = require("./Panel").Panel;
      const PanelGroup = require("./PanelGroup").PanelGroup;

      act(() => {
        const root = createRoot(document.createElement("div"));
        root.render(
          <PanelGroup direction="horizontal">
            <Panel defaultSizePercentage={100} />
            <Panel defaultSizePixels={1_000} />
          </PanelGroup>
        );
      });

      expectWarning(
        "Panel defaultSizePercentage or defaultSizePixels prop recommended to avoid layout shift after server rendering"
      );

      act(() => {
        const root = createRoot(document.createElement("div"));
        root.render(
          <PanelGroup direction="horizontal">
            <Panel id="one" />
          </PanelGroup>
        );
      });
    });
  });
});

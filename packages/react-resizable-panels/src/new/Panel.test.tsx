import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { createRef } from "../vendor/react";
import { ImperativePanelHandle, Panel } from "./Panel";
import { PanelGroup } from "./PanelGroup";
import {
  mockOffsetWidthAndHeight,
  verifyExpandedPanelGroupLayout,
} from "./utils/test-utils";
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
    describe("collapse and expand", () => {
      let leftPanelRef = createRef<ImperativePanelHandle>();
      let rightPanelRef = createRef<ImperativePanelHandle>();

      let mostRecentLayout: MixedSizes[] | null;

      beforeEach(() => {
        leftPanelRef = createRef<ImperativePanelHandle>();
        rightPanelRef = createRef<ImperativePanelHandle>();

        mostRecentLayout = null;

        const onLayout = (layout: MixedSizes[]) => {
          mostRecentLayout = layout;
        };

        act(() => {
          root.render(
            <PanelGroup direction="horizontal" onLayout={onLayout}>
              <Panel
                collapsible
                defaultSizePercentage={50}
                ref={leftPanelRef}
              />
              <Panel
                collapsible
                defaultSizePercentage={50}
                ref={rightPanelRef}
              />
            </PanelGroup>
          );
        });
      });

      it("should expand and collapse the first panel in a group", () => {
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [50, 50]);
        act(() => {
          leftPanelRef.current!.collapse();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [0, 100]);
        act(() => {
          leftPanelRef.current!.expand();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [50, 50]);
      });

      it("should expand and collapse the last panel in a group", () => {
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [50, 50]);
        act(() => {
          rightPanelRef.current!.collapse();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [100, 0]);
        act(() => {
          rightPanelRef.current!.expand();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [50, 50]);
      });

      it("should re-expand to the most recent size before collapsing", () => {
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [50, 50]);
        act(() => {
          leftPanelRef.current!.resize({ sizePercentage: 30 });
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [30, 70]);
        act(() => {
          leftPanelRef.current!.collapse();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [0, 100]);
        act(() => {
          leftPanelRef.current!.expand();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [30, 70]);
      });
    });

    describe("resize", () => {
      let leftPanelRef = createRef<ImperativePanelHandle>();
      let middlePanelRef = createRef<ImperativePanelHandle>();
      let rightPanelRef = createRef<ImperativePanelHandle>();

      let mostRecentLayout: MixedSizes[] | null;

      beforeEach(() => {
        leftPanelRef = createRef<ImperativePanelHandle>();
        middlePanelRef = createRef<ImperativePanelHandle>();
        rightPanelRef = createRef<ImperativePanelHandle>();

        mostRecentLayout = null;

        const onLayout = (layout: MixedSizes[]) => {
          mostRecentLayout = layout;
        };

        act(() => {
          root.render(
            <PanelGroup direction="horizontal" onLayout={onLayout}>
              <Panel defaultSizePercentage={20} ref={leftPanelRef} />
              <Panel defaultSizePercentage={60} ref={middlePanelRef} />
              <Panel defaultSizePercentage={20} ref={rightPanelRef} />
            </PanelGroup>
          );
        });
      });

      it("should resize the first panel in a group", () => {
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [20, 60, 20]);
        act(() => {
          leftPanelRef.current!.resize({ sizePercentage: 40 });
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [40, 40, 20]);
      });

      it("should resize the middle panel in a group", () => {
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [20, 60, 20]);
        act(() => {
          middlePanelRef.current!.resize({ sizePercentage: 40 });
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [20, 40, 40]);
      });

      it("should resize the last panel in a group", () => {
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [20, 60, 20]);
        act(() => {
          rightPanelRef.current!.resize({ sizePercentage: 40 });
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout!, [20, 40, 40]);
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

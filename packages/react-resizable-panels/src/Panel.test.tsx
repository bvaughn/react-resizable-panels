import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import {
  ImperativePanelHandle,
  MixedSizes,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from ".";
import {
  mockPanelGroupOffsetWidthAndHeight,
  verifyExpandedPanelGroupLayout,
} from "./utils/test-utils";
import { createRef } from "./vendor/react";

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

    uninstallMockOffsetWidthAndHeight = mockPanelGroupOffsetWidthAndHeight();

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
              <PanelResizeHandle />
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
              <PanelResizeHandle />
              <Panel defaultSizePercentage={60} ref={middlePanelRef} />
              <PanelResizeHandle />
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

  describe("invariants", () => {
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation(() => {
        // Noop
      });
    });

    it("should throw if default size is less than 0 or greater than 100", () => {
      expect(() => {
        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel defaultSizePercentage={-1} />
            </PanelGroup>
          );
        });
      }).toThrow("Invalid layout");

      expect(() => {
        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel defaultSizePercentage={101} />
            </PanelGroup>
          );
        });
      }).toThrow("Invalid layout");
    });

    it("should throw if rendered outside of a PanelGroup", () => {
      expect(() => {
        act(() => {
          root.render(<Panel />);
        });
      }).toThrow(
        "Panel components must be rendered within a PanelGroup container"
      );
    });
  });

  describe("DEV warnings", () => {
    it("should warn about server rendered panels with no default size", () => {
      jest.resetModules();
      jest.mock("#is-browser", () => ({ isBrowser: false }));

      const { TextEncoder } = require("util");
      global.TextEncoder = TextEncoder;

      const { renderToStaticMarkup } = require("react-dom/server.browser");
      const { act } = require("react-dom/test-utils");
      const Panel = require("./Panel").Panel;
      const PanelGroup = require("./PanelGroup").PanelGroup;
      const PanelResizeHandle =
        require("./PanelResizeHandle").PanelResizeHandle;

      act(() => {
        // No warning expected if default sizes provided
        renderToStaticMarkup(
          <PanelGroup direction="horizontal">
            <Panel defaultSizePercentage={100} />
            <PanelResizeHandle />
            <Panel defaultSizePixels={1_000} />
          </PanelGroup>
        );
      });

      expectWarning(
        "Panel defaultSizePercentage or defaultSizePixels prop recommended to avoid layout shift after server rendering"
      );

      act(() => {
        renderToStaticMarkup(
          <PanelGroup direction="horizontal">
            <Panel id="one" />
          </PanelGroup>
        );
      });
    });

    it("should warn if both pixel and percentage units are specified", () => {
      // We just spot check this here; validatePanelConstraints() has its own in-depth tests
      expectWarning(
        "should not specify both percentage and pixel units for: min size"
      );

      expectWarning("Pixel based constraints require ResizeObserver");

      act(() => {
        root.render(
          <PanelGroup direction="horizontal" key="minSize">
            <Panel minSizePercentage={100} minSizePixels={1_000} />
          </PanelGroup>
        );
      });
    });

    it("should warn if invalid sizes are specified declaratively", () => {
      expectWarning("default size should not be less than 0");

      act(() => {
        root.render(
          <PanelGroup direction="horizontal" key="collapsedSize">
            <Panel defaultSizePercentage={-1} />
            <PanelResizeHandle />
            <Panel />
          </PanelGroup>
        );
      });
    });
  });
});

import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { MixedSizes } from "..";
import { Panel } from "./Panel";
import { ImperativePanelGroupHandle, PanelGroup } from "./PanelGroup";
import { mockOffsetWidthAndHeight } from "./utils/test-utils";
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

    // JSDom doesn't support element sizes
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
    it("should report the most recently rendered group id", () => {
      const ref = createRef<ImperativePanelGroupHandle>();

      act(() => {
        root.render(<PanelGroup direction="horizontal" id="one" ref={ref} />);
      });

      expect(ref.current!.getId()).toBe("one");

      act(() => {
        root.render(<PanelGroup direction="horizontal" id="two" ref={ref} />);
      });

      expect(ref.current!.getId()).toBe("two");
    });

    it("should get and set layouts", () => {
      const ref = createRef<ImperativePanelGroupHandle>();

      let mostRecentLayout: MixedSizes[] | null = null;

      const onLayout = (layout: MixedSizes[]) => {
        mostRecentLayout = layout;
      };

      act(() => {
        root.render(
          <PanelGroup direction="horizontal" onLayout={onLayout} ref={ref}>
            <Panel defaultSizePercentage={50} id="a" />
            <Panel defaultSizePercentage={50} id="b" />
          </PanelGroup>
        );
      });

      expect(mostRecentLayout).toEqual([
        {
          sizePercentage: 50,
          sizePixels: 500,
        },
        {
          sizePercentage: 50,
          sizePixels: 500,
        },
      ]);

      act(() => {
        ref.current!.setLayout([
          { sizePercentage: 25 },
          { sizePercentage: 75 },
        ]);
      });

      expect(mostRecentLayout).toEqual([
        {
          sizePercentage: 25,
          sizePixels: 250,
        },
        {
          sizePercentage: 75,
          sizePixels: 750,
        },
      ]);
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

    // TODO Verify warning if invalid layout is set via imperative api
  });
});

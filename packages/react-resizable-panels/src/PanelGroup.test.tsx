import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import {
  ImperativePanelGroupHandle,
  MixedSizes,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from ".";
import { mockPanelGroupOffsetWidthAndHeight } from "./utils/test-utils";
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
            <PanelResizeHandle />
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
            <PanelResizeHandle />
            <Panel defaultSizePercentage={50} id="b" />
          </PanelGroup>
        );
      });
    });

    it("should warn about missing resize handles", () => {
      expectWarning(
        'Missing resize handle for PanelGroup "group-without-handle"'
      );

      act(() => {
        root.render(
          <PanelGroup direction="horizontal" id="group-without-handle">
            <Panel />
            <Panel />
          </PanelGroup>
        );
      });
    });

    it("should warn about an invalid declarative layout", () => {
      expectWarning("Invalid layout total size: 60%, 80%");

      act(() => {
        root.render(
          <PanelGroup direction="horizontal" id="group-without-handle">
            <Panel defaultSizePercentage={60} />
            <PanelResizeHandle />
            <Panel defaultSizePercentage={80} />
          </PanelGroup>
        );
      });
    });

    it("should warn about an invalid layout set via the imperative api", () => {
      const ref = createRef<ImperativePanelGroupHandle>();

      act(() => {
        root.render(
          <PanelGroup
            direction="horizontal"
            id="group-without-handle"
            ref={ref}
          >
            <Panel defaultSizePercentage={30} />
            <PanelResizeHandle />
            <Panel defaultSizePercentage={70} />
          </PanelGroup>
        );
      });

      expectWarning("Invalid layout total size: 60%, 80%");

      act(() => {
        ref.current!.setLayout([
          { sizePercentage: 60 },
          { sizePercentage: 80 },
        ]);
      });
    });
  });
});

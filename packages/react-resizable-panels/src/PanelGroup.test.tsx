import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from ".";
import { assert } from "./utils/assert";
import { getPanelGroupElement } from "./utils/dom/getPanelGroupElement";
import { mockPanelGroupOffsetWidthAndHeight } from "./utils/test-utils";
import { createRef } from "./vendor/react";

describe("PanelGroup", () => {
  let expectedWarnings: string[] = [];
  let root: Root;
  let container: HTMLElement;
  let uninstallMockOffsetWidthAndHeight: () => void;

  function expectWarning(expectedMessage: string) {
    expectedWarnings.push(expectedMessage);
  }

  beforeEach(() => {
    // @ts-expect-error
    global.IS_REACT_ACT_ENVIRONMENT = true;

    // JSDom doesn't support element sizes
    uninstallMockOffsetWidthAndHeight = mockPanelGroupOffsetWidthAndHeight();

    container = document.createElement("div");
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

      expect(ref.current?.getId()).toBe("one");

      act(() => {
        root.render(<PanelGroup direction="horizontal" id="two" ref={ref} />);
      });

      expect(ref.current?.getId()).toBe("two");
    });

    it("should get and set layouts", () => {
      const ref = createRef<ImperativePanelGroupHandle>();

      let mostRecentLayout: number[] | null = null;

      const onLayout = (layout: number[]) => {
        mostRecentLayout = layout;
      };

      act(() => {
        root.render(
          <PanelGroup direction="horizontal" onLayout={onLayout} ref={ref}>
            <Panel defaultSize={50} id="a" />
            <PanelResizeHandle />
            <Panel defaultSize={50} id="b" />
          </PanelGroup>
        );
      });

      expect(mostRecentLayout).toEqual([50, 50]);

      act(() => {
        ref.current?.setLayout([25, 75]);
      });

      expect(mostRecentLayout).toEqual([25, 75]);
    });
  });

  it("should support ...rest attributes", () => {
    act(() => {
      root.render(
        <PanelGroup
          data-test-name="foo"
          direction="horizontal"
          id="group"
          tabIndex={123}
          title="bar"
        >
          <Panel />
          <PanelResizeHandle />
          <Panel />
        </PanelGroup>
      );
    });

    const element = getPanelGroupElement("group", container);
    assert(element);
    expect(element.tabIndex).toBe(123);
    expect(element.getAttribute("data-test-name")).toBe("foo");
    expect(element.title).toBe("bar");
  });

  describe("callbacks", () => {
    describe("onLayout", () => {
      it("should be called with the initial group layout on mount", () => {
        let onLayout = jest.fn();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal" onLayout={onLayout}>
              <Panel defaultSize={35} />
              <PanelResizeHandle />
              <Panel defaultSize={65} />
            </PanelGroup>
          );
        });

        expect(onLayout).toHaveBeenCalledTimes(1);
        expect(onLayout).toHaveBeenCalledWith([35, 65]);
      });

      it("should be called any time the group layout changes", () => {
        let onLayout = jest.fn();
        let panelGroupRef = createRef<ImperativePanelGroupHandle>();
        let panelRef = createRef<ImperativePanelHandle>();

        act(() => {
          root.render(
            <PanelGroup
              direction="horizontal"
              onLayout={onLayout}
              ref={panelGroupRef}
            >
              <Panel defaultSize={35} ref={panelRef} />
              <PanelResizeHandle />
              <Panel defaultSize={65} />
            </PanelGroup>
          );
        });

        onLayout.mockReset();

        act(() => {
          panelGroupRef.current?.setLayout([25, 75]);
        });

        expect(onLayout).toHaveBeenCalledTimes(1);
        expect(onLayout).toHaveBeenCalledWith([25, 75]);

        onLayout.mockReset();

        act(() => {
          panelRef.current?.resize(50);
        });

        expect(onLayout).toHaveBeenCalledTimes(1);
        expect(onLayout).toHaveBeenCalledWith([50, 50]);
      });
    });
  });

  describe("DEV warnings", () => {
    it("should warn about unstable layouts without id and order props", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel defaultSize={100} id="a" />
          </PanelGroup>
        );
      });

      expectWarning(
        "Panel id and order props recommended when panels are dynamically rendered"
      );

      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel defaultSize={50} id="a" />
            <PanelResizeHandle />
            <Panel defaultSize={50} id="b" />
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
            <Panel defaultSize={60} />
            <PanelResizeHandle />
            <Panel defaultSize={80} />
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
            <Panel defaultSize={30} />
            <PanelResizeHandle />
            <Panel defaultSize={70} />
          </PanelGroup>
        );
      });

      expectWarning("Invalid layout total size: 60%, 80%");

      act(() => {
        ref.current?.setLayout([60, 80]);
      });
    });
  });
});

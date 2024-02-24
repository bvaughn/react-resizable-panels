import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { ImperativePanelHandle, Panel, PanelGroup, PanelResizeHandle } from ".";
import { assert } from "./utils/assert";
import { getPanelElement } from "./utils/dom/getPanelElement";
import {
  mockPanelGroupOffsetWidthAndHeight,
  verifyAttribute,
  verifyExpandedPanelGroupLayout,
} from "./utils/test-utils";
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
    describe("collapse and expand", () => {
      let leftPanelRef = createRef<ImperativePanelHandle>();
      let rightPanelRef = createRef<ImperativePanelHandle>();

      let mostRecentLayout: number[] | null;

      beforeEach(() => {
        leftPanelRef = createRef<ImperativePanelHandle>();
        rightPanelRef = createRef<ImperativePanelHandle>();

        mostRecentLayout = null;

        const onLayout = (layout: number[]) => {
          mostRecentLayout = layout;
        };

        act(() => {
          root.render(
            <PanelGroup direction="horizontal" onLayout={onLayout}>
              <Panel collapsible defaultSize={50} ref={leftPanelRef} />
              <PanelResizeHandle />
              <Panel collapsible defaultSize={50} ref={rightPanelRef} />
            </PanelGroup>
          );
        });
      });

      it("should expand and collapse the first panel in a group", () => {
        assert(mostRecentLayout, "");

        verifyExpandedPanelGroupLayout(mostRecentLayout, [50, 50]);
        expect(leftPanelRef.current?.isCollapsed()).toBe(false);
        expect(rightPanelRef.current?.isCollapsed()).toBe(false);
        act(() => {
          leftPanelRef.current?.collapse();
        });
        expect(leftPanelRef.current?.isCollapsed()).toBe(true);
        expect(rightPanelRef.current?.isCollapsed()).toBe(false);
        verifyExpandedPanelGroupLayout(mostRecentLayout, [0, 100]);
        act(() => {
          leftPanelRef.current?.expand();
        });
        expect(leftPanelRef.current?.isCollapsed()).toBe(false);
        expect(rightPanelRef.current?.isCollapsed()).toBe(false);
        verifyExpandedPanelGroupLayout(mostRecentLayout, [50, 50]);
      });

      it("should expand and collapse the last panel in a group", () => {
        assert(mostRecentLayout, "");

        verifyExpandedPanelGroupLayout(mostRecentLayout, [50, 50]);
        expect(leftPanelRef.current?.isCollapsed()).toBe(false);
        expect(rightPanelRef.current?.isCollapsed()).toBe(false);
        act(() => {
          rightPanelRef.current?.collapse();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout, [100, 0]);
        expect(leftPanelRef.current?.isCollapsed()).toBe(false);
        expect(rightPanelRef.current?.isCollapsed()).toBe(true);
        act(() => {
          rightPanelRef.current?.expand();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout, [50, 50]);
        expect(leftPanelRef.current?.isCollapsed()).toBe(false);
        expect(rightPanelRef.current?.isCollapsed()).toBe(false);
      });

      it("should re-expand to the most recent size before collapsing", () => {
        assert(mostRecentLayout, "");

        verifyExpandedPanelGroupLayout(mostRecentLayout, [50, 50]);
        act(() => {
          leftPanelRef.current?.resize(30);
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout, [30, 70]);
        act(() => {
          leftPanelRef.current?.collapse();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout, [0, 100]);
        act(() => {
          leftPanelRef.current?.expand();
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout, [30, 70]);
      });
    });

    describe("resize", () => {
      let leftPanelRef = createRef<ImperativePanelHandle>();
      let middlePanelRef = createRef<ImperativePanelHandle>();
      let rightPanelRef = createRef<ImperativePanelHandle>();

      let mostRecentLayout: number[] | null;

      beforeEach(() => {
        leftPanelRef = createRef<ImperativePanelHandle>();
        middlePanelRef = createRef<ImperativePanelHandle>();
        rightPanelRef = createRef<ImperativePanelHandle>();

        mostRecentLayout = null;

        const onLayout = (layout: number[]) => {
          mostRecentLayout = layout;
        };

        act(() => {
          root.render(
            <PanelGroup direction="horizontal" onLayout={onLayout}>
              <Panel defaultSize={20} ref={leftPanelRef} />
              <PanelResizeHandle />
              <Panel defaultSize={60} ref={middlePanelRef} />
              <PanelResizeHandle />
              <Panel defaultSize={20} ref={rightPanelRef} />
            </PanelGroup>
          );
        });
      });

      it("should resize the first panel in a group", () => {
        assert(mostRecentLayout, "");

        verifyExpandedPanelGroupLayout(mostRecentLayout, [20, 60, 20]);
        act(() => {
          leftPanelRef.current?.resize(40);
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout, [40, 40, 20]);
      });

      it("should resize the middle panel in a group", () => {
        assert(mostRecentLayout, "");

        verifyExpandedPanelGroupLayout(mostRecentLayout, [20, 60, 20]);
        act(() => {
          middlePanelRef.current?.resize(40);
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout, [20, 40, 40]);
      });

      it("should resize the last panel in a group", () => {
        assert(mostRecentLayout, "");

        verifyExpandedPanelGroupLayout(mostRecentLayout, [20, 60, 20]);
        act(() => {
          rightPanelRef.current?.resize(40);
        });
        verifyExpandedPanelGroupLayout(mostRecentLayout, [20, 40, 40]);
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
              <Panel defaultSize={-1} />
            </PanelGroup>
          );
        });
      }).toThrow("Invalid layout");

      expect(() => {
        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel defaultSize={101} />
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

  it("should support ...rest attributes", () => {
    act(() => {
      root.render(
        <PanelGroup direction="horizontal">
          <Panel data-test-name="foo" id="panel" tabIndex={123} title="bar" />
          <PanelResizeHandle />
          <Panel />
        </PanelGroup>
      );
    });

    const element = getPanelElement("panel", container);
    assert(element, "");
    expect(element.tabIndex).toBe(123);
    expect(element.getAttribute("data-test-name")).toBe("foo");
    expect(element.title).toBe("bar");
  });

  describe("constraints", () => {
    it("should resize a collapsed panel if the collapsedSize prop changes", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel
              id="left"
              collapsedSize={10}
              collapsible
              defaultSize={10}
              minSize={25}
            />
            <PanelResizeHandle />
            <Panel id="middle" />
            <PanelResizeHandle />
            <Panel
              id="right"
              collapsedSize={10}
              collapsible
              defaultSize={10}
              minSize={25}
            />
          </PanelGroup>
        );
      });

      let leftElement = getPanelElement("left", container);
      let middleElement = getPanelElement("middle", container);
      let rightElement = getPanelElement("right", container);
      assert(leftElement, "");
      assert(middleElement, "");
      assert(rightElement, "");
      expect(leftElement.getAttribute("data-panel-size")).toBe("10.0");
      expect(middleElement.getAttribute("data-panel-size")).toBe("80.0");
      expect(rightElement.getAttribute("data-panel-size")).toBe("10.0");

      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel id="left" collapsedSize={5} collapsible minSize={25} />
            <PanelResizeHandle />
            <Panel id="middle" />
            <PanelResizeHandle />
            <Panel id="right" collapsedSize={5} collapsible minSize={25} />
          </PanelGroup>
        );
      });

      expect(leftElement.getAttribute("data-panel-size")).toBe("5.0");
      expect(middleElement.getAttribute("data-panel-size")).toBe("90.0");
      expect(rightElement.getAttribute("data-panel-size")).toBe("5.0");
    });

    it("it should not expand a collapsed panel if other constraints change", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel
              id="left"
              collapsedSize={10}
              collapsible
              defaultSize={10}
              minSize={25}
            />
            <PanelResizeHandle />
            <Panel id="middle" />
            <PanelResizeHandle />
            <Panel
              id="right"
              collapsedSize={10}
              collapsible
              defaultSize={10}
              minSize={25}
            />
          </PanelGroup>
        );
      });

      let leftElement = getPanelElement("left", container);
      let middleElement = getPanelElement("middle", container);
      let rightElement = getPanelElement("right", container);
      assert(leftElement, "");
      assert(middleElement, "");
      assert(rightElement, "");
      expect(leftElement.getAttribute("data-panel-size")).toBe("10.0");
      expect(middleElement.getAttribute("data-panel-size")).toBe("80.0");
      expect(rightElement.getAttribute("data-panel-size")).toBe("10.0");

      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel id="left" collapsedSize={10} collapsible minSize={20} />
            <PanelResizeHandle />
            <Panel id="middle" />
            <PanelResizeHandle />
            <Panel id="right" collapsedSize={10} collapsible minSize={20} />
          </PanelGroup>
        );
      });

      expect(leftElement.getAttribute("data-panel-size")).toBe("10.0");
      expect(middleElement.getAttribute("data-panel-size")).toBe("80.0");
      expect(rightElement.getAttribute("data-panel-size")).toBe("10.0");
    });

    it("should resize a panel if the minSize prop changes", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel id="left" defaultSize={15} minSize={10} />
            <PanelResizeHandle />
            <Panel id="middle" />
            <PanelResizeHandle />
            <Panel id="right" defaultSize={15} minSize={10} />
          </PanelGroup>
        );
      });

      let leftElement = getPanelElement("left", container);
      let middleElement = getPanelElement("middle", container);
      let rightElement = getPanelElement("right", container);
      assert(leftElement, "");
      assert(middleElement, "");
      assert(rightElement, "");
      expect(leftElement.getAttribute("data-panel-size")).toBe("15.0");
      expect(middleElement.getAttribute("data-panel-size")).toBe("70.0");
      expect(rightElement.getAttribute("data-panel-size")).toBe("15.0");

      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel id="left" minSize={20} />
            <PanelResizeHandle />
            <Panel id="middle" />
            <PanelResizeHandle />
            <Panel id="right" minSize={20} />
          </PanelGroup>
        );
      });

      expect(leftElement.getAttribute("data-panel-size")).toBe("20.0");
      expect(middleElement.getAttribute("data-panel-size")).toBe("60.0");
      expect(rightElement.getAttribute("data-panel-size")).toBe("20.0");
    });

    it("should resize a panel if the maxSize prop changes", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel id="left" defaultSize={25} maxSize={30} />
            <PanelResizeHandle />
            <Panel id="middle" />
            <PanelResizeHandle />
            <Panel id="right" defaultSize={25} maxSize={30} />
          </PanelGroup>
        );
      });

      let leftElement = getPanelElement("left", container);
      let middleElement = getPanelElement("middle", container);
      let rightElement = getPanelElement("right", container);
      assert(leftElement, "");
      assert(middleElement, "");
      assert(rightElement, "");
      expect(leftElement.getAttribute("data-panel-size")).toBe("25.0");
      expect(middleElement.getAttribute("data-panel-size")).toBe("50.0");
      expect(rightElement.getAttribute("data-panel-size")).toBe("25.0");

      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel id="left" maxSize={20} />
            <PanelResizeHandle />
            <Panel id="middle" />
            <PanelResizeHandle />
            <Panel id="right" maxSize={20} />
          </PanelGroup>
        );
      });

      expect(leftElement.getAttribute("data-panel-size")).toBe("20.0");
      expect(middleElement.getAttribute("data-panel-size")).toBe("60.0");
      expect(rightElement.getAttribute("data-panel-size")).toBe("20.0");
    });
  });

  describe("callbacks", () => {
    describe("onCollapse", () => {
      it("should be called on mount if a panels initial size is 0", () => {
        let onCollapseLeft = jest.fn();
        let onCollapseRight = jest.fn();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel collapsible defaultSize={0} onCollapse={onCollapseLeft} />
              <PanelResizeHandle />
              <Panel collapsible onCollapse={onCollapseRight} />
            </PanelGroup>
          );
        });

        expect(onCollapseLeft).toHaveBeenCalledTimes(1);
        expect(onCollapseRight).not.toHaveBeenCalled();
      });

      it("should be called when a panel is collapsed", () => {
        let onCollapse = jest.fn();

        let panelRef = createRef<ImperativePanelHandle>();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel collapsible onCollapse={onCollapse} ref={panelRef} />
              <PanelResizeHandle />
              <Panel />
            </PanelGroup>
          );
        });

        expect(onCollapse).not.toHaveBeenCalled();

        act(() => {
          panelRef.current?.collapse();
        });

        expect(onCollapse).toHaveBeenCalledTimes(1);
      });
    });

    describe("onExpand", () => {
      it("should be called on mount if a collapsible panels initial size is not 0", () => {
        let onExpandLeft = jest.fn();
        let onExpandRight = jest.fn();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel collapsible onExpand={onExpandLeft} />
              <PanelResizeHandle />
              <Panel onExpand={onExpandRight} />
            </PanelGroup>
          );
        });

        expect(onExpandLeft).toHaveBeenCalledTimes(1);
        expect(onExpandRight).not.toHaveBeenCalled();
      });

      it("should be called when a collapsible panel is expanded", () => {
        let onExpand = jest.fn();

        let panelRef = createRef<ImperativePanelHandle>();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel
                collapsible
                defaultSize={0}
                onExpand={onExpand}
                ref={panelRef}
              />
              <PanelResizeHandle />
              <Panel />
            </PanelGroup>
          );
        });

        expect(onExpand).not.toHaveBeenCalled();

        act(() => {
          panelRef.current?.resize(25);
        });

        expect(onExpand).toHaveBeenCalledTimes(1);
      });
    });

    describe("onResize", () => {
      it("should be called on mount", () => {
        let onResizeLeft = jest.fn();
        let onResizeMiddle = jest.fn();
        let onResizeRight = jest.fn();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel id="left" onResize={onResizeLeft} order={1} />
              <PanelResizeHandle />
              <Panel
                defaultSize={50}
                id="middle"
                onResize={onResizeMiddle}
                order={2}
              />
              <PanelResizeHandle />
              <Panel id="right" onResize={onResizeRight} order={3} />
            </PanelGroup>
          );
        });

        expect(onResizeLeft).toHaveBeenCalledTimes(1);
        expect(onResizeLeft).toHaveBeenCalledWith(25, undefined);
        expect(onResizeMiddle).toHaveBeenCalledTimes(1);
        expect(onResizeMiddle).toHaveBeenCalledWith(50, undefined);
        expect(onResizeRight).toHaveBeenCalledTimes(1);
        expect(onResizeRight).toHaveBeenCalledWith(25, undefined);
      });

      it("should be called when a panel is added or removed from the group", () => {
        let onResizeLeft = jest.fn();
        let onResizeMiddle = jest.fn();
        let onResizeRight = jest.fn();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel
                id="middle"
                key="middle"
                onResize={onResizeMiddle}
                order={2}
              />
            </PanelGroup>
          );
        });

        expect(onResizeLeft).not.toHaveBeenCalled();
        expect(onResizeMiddle).toHaveBeenCalledWith(100, undefined);
        expect(onResizeRight).not.toHaveBeenCalled();

        onResizeLeft.mockReset();
        onResizeMiddle.mockReset();
        onResizeRight.mockReset();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel
                id="left"
                key="left"
                maxSize={25}
                minSize={25}
                onResize={onResizeLeft}
                order={1}
              />
              <PanelResizeHandle />
              <Panel
                id="middle"
                key="middle"
                onResize={onResizeMiddle}
                order={2}
              />
              <PanelResizeHandle />
              <Panel
                id="right"
                key="right"
                maxSize={25}
                minSize={25}
                onResize={onResizeRight}
                order={3}
              />
            </PanelGroup>
          );
        });

        expect(onResizeLeft).toHaveBeenCalledTimes(1);
        expect(onResizeLeft).toHaveBeenCalledWith(25, undefined);
        expect(onResizeMiddle).toHaveBeenCalledTimes(1);
        expect(onResizeMiddle).toHaveBeenCalledWith(50, 100);
        expect(onResizeRight).toHaveBeenCalledTimes(1);
        expect(onResizeRight).toHaveBeenCalledWith(25, undefined);

        onResizeLeft.mockReset();
        onResizeMiddle.mockReset();
        onResizeRight.mockReset();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel
                id="left"
                key="left"
                maxSize={25}
                minSize={25}
                onResize={onResizeLeft}
                order={1}
              />
              <PanelResizeHandle />
              <Panel
                id="middle"
                key="middle"
                onResize={onResizeMiddle}
                order={2}
              />
            </PanelGroup>
          );
        });

        expect(onResizeLeft).not.toHaveBeenCalled();
        expect(onResizeMiddle).toHaveBeenCalledTimes(1);
        expect(onResizeMiddle).toHaveBeenCalledWith(75, 50);
        expect(onResizeRight).not.toHaveBeenCalled();
      });
    });
  });

  describe("data attributes", () => {
    it("should initialize with the correct props based attributes", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal" id="test-group">
            <Panel defaultSize={75} id="left-panel" />
            <PanelResizeHandle />
            <Panel collapsible id="right-panel" />
          </PanelGroup>
        );
      });

      const leftElement = getPanelElement("left-panel", container);
      const rightElement = getPanelElement("right-panel", container);

      assert(leftElement, "");
      assert(rightElement, "");

      verifyAttribute(leftElement, "data-panel", "");
      verifyAttribute(leftElement, "data-panel-id", "left-panel");
      verifyAttribute(leftElement, "data-panel-group-id", "test-group");
      verifyAttribute(leftElement, "data-panel-size", "75.0");
      verifyAttribute(leftElement, "data-panel-collapsible", null);

      verifyAttribute(rightElement, "data-panel", "");
      verifyAttribute(rightElement, "data-panel-id", "right-panel");
      verifyAttribute(rightElement, "data-panel-group-id", "test-group");
      verifyAttribute(rightElement, "data-panel-size", "25.0");
      verifyAttribute(rightElement, "data-panel-collapsible", "true");
    });

    it("should update the data-panel-size attribute when the panel resizes", () => {
      const leftPanelRef = createRef<ImperativePanelHandle>();

      act(() => {
        root.render(
          <PanelGroup direction="horizontal" id="test-group">
            <Panel defaultSize={75} id="left-panel" ref={leftPanelRef} />
            <PanelResizeHandle />
            <Panel collapsible id="right-panel" />
          </PanelGroup>
        );
      });

      const leftElement = getPanelElement("left-panel", container);
      const rightElement = getPanelElement("right-panel", container);

      assert(leftElement, "");
      assert(rightElement, "");

      verifyAttribute(leftElement, "data-panel-size", "75.0");
      verifyAttribute(rightElement, "data-panel-size", "25.0");

      act(() => {
        leftPanelRef.current?.resize(30);
      });

      verifyAttribute(leftElement, "data-panel-size", "30.0");
      verifyAttribute(rightElement, "data-panel-size", "70.0");
    });
  });

  describe("a11y", () => {
    it("should pass explicit id prop to DOM", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel id="explicit-id" />
          </PanelGroup>
        );
      });

      const element = container.querySelector("[data-panel]");

      expect(element).not.toBeNull();
      expect(element?.getAttribute("id")).toBe("explicit-id");
    });

    it("should not pass auto-generated id prop to DOM", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel />
          </PanelGroup>
        );
      });

      const element = container.querySelector("[data-panel]");

      expect(element).not.toBeNull();
      expect(element?.getAttribute("id")).toBeNull();
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

    it("should warn if invalid sizes are specified declaratively", () => {
      expectWarning("default size should not be less than 0");

      act(() => {
        root.render(
          <PanelGroup direction="horizontal" key="collapsedSize">
            <Panel defaultSize={-1} />
            <PanelResizeHandle />
            <Panel />
          </PanelGroup>
        );
      });
    });
  });
});

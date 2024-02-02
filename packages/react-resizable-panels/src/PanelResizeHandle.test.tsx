import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { Panel, PanelGroup, PanelResizeHandle } from ".";
import { assert } from "./utils/assert";
import { getResizeHandleElement } from "./utils/dom/getResizeHandleElement";
import { dispatchPointerEvent } from "./utils/test-utils";

describe("PanelResizeHandle", () => {
  let expectedWarnings: string[] = [];
  let root: Root;
  let container: HTMLElement;

  beforeEach(() => {
    // @ts-expect-error
    global.IS_REACT_ACT_ENVIRONMENT = true;
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
    jest.clearAllMocks();
    jest.resetModules();

    act(() => {
      root.unmount();
    });

    expect(expectedWarnings).toHaveLength(0);
  });

  it("should support ...rest attributes", () => {
    act(() => {
      root.render(
        <PanelGroup direction="horizontal">
          <Panel />
          <PanelResizeHandle
            data-test-name="foo"
            id="handle"
            tabIndex={123}
            title="bar"
          />
          <Panel />
        </PanelGroup>
      );
    });

    const element = getResizeHandleElement("handle", container);
    assert(element);
    expect(element.tabIndex).toBe(123);
    expect(element.getAttribute("data-test-name")).toBe("foo");
    expect(element.title).toBe("bar");
  });

  describe("callbacks", () => {
    describe("onDragging", () => {
      it("should fire when dragging starts/stops", async () => {
        const onDragging = jest.fn();

        act(() => {
          root.render(
            <PanelGroup direction="horizontal">
              <Panel />
              <PanelResizeHandle
                id="handle"
                onDragging={onDragging}
                tabIndex={123}
                title="bar"
              />
              <Panel />
            </PanelGroup>
          );
        });

        const handleElement = container.querySelector(
          '[data-panel-resize-handle-id="handle"]'
        ) as HTMLElement;

        act(() => {
          dispatchPointerEvent("mouseover", handleElement);
        });
        expect(onDragging).not.toHaveBeenCalled();

        act(() => {
          dispatchPointerEvent("mousedown", handleElement);
        });
        expect(onDragging).toHaveBeenCalledTimes(1);
        expect(onDragging).toHaveBeenCalledWith(true);

        act(() => {
          dispatchPointerEvent("mouseup", handleElement);
        });
        expect(onDragging).toHaveBeenCalledTimes(2);
        expect(onDragging).toHaveBeenCalledWith(false);
      });
    });
  });
});

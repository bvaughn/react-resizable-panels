import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type PanelResizeHandleProps,
} from ".";
import { RESIZE_HANDLE_ATTRIBUTES } from "./constants";
import { assert } from "./utils/assert";
import * as cursorUtils from "./utils/cursor";
import { getResizeHandleElement } from "./utils/dom/getResizeHandleElement";
import {
  dispatchPointerEvent,
  mockBoundingClientRect,
  verifyAttribute,
} from "./utils/test-utils";

jest.mock("./utils/cursor", () => ({
  getCursorStyle: jest.fn(),
  resetGlobalCursorStyle: jest.fn(),
  setGlobalCursorStyle: jest.fn(),
}));

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
    assert(element, "");
    expect(element.tabIndex).toBe(123);
    expect(element.getAttribute("data-test-name")).toBe("foo");
    expect(element.title).toBe("bar");
  });

  function setupMockedGroup({
    leftProps = {},
    rightProps = {},
  }: {
    leftProps?: Partial<PanelResizeHandleProps>;
    rightProps?: Partial<PanelResizeHandleProps>;
  } = {}) {
    act(() => {
      root.render(
        <PanelGroup direction="horizontal" id="test-group">
          <Panel />
          <PanelResizeHandle id="handle-left" tabIndex={1} {...leftProps} />
          <Panel />
          <PanelResizeHandle id="handle-right" tabIndex={2} {...rightProps} />
          <Panel />
        </PanelGroup>
      );
    });

    const leftElement = getResizeHandleElement("handle-left", container);
    const rightElement = getResizeHandleElement("handle-right", container);

    assert(leftElement, "");
    assert(rightElement, "");

    // JSDom doesn't properly handle bounding rects
    mockBoundingClientRect(leftElement, {
      x: 50,
      y: 0,
      height: 50,
      width: 2,
    });
    mockBoundingClientRect(rightElement, {
      x: 100,
      y: 0,
      height: 50,
      width: 2,
    });

    return {
      leftElement,
      rightElement,
    };
  }

  describe("callbacks", () => {
    it("should fire when dragging starts/stops", () => {
      const onDragging = jest.fn();
      const onPointerDown = jest.fn();
      const onPointerUp = jest.fn();

      const { leftElement } = setupMockedGroup({
        leftProps: { onDragging, onPointerDown, onPointerUp },
      });

      act(() => {
        dispatchPointerEvent("pointermove", leftElement);
      });
      expect(onPointerDown).not.toHaveBeenCalled();
      expect(onDragging).not.toHaveBeenCalled();
      expect(onPointerUp).not.toHaveBeenCalled();

      act(() => {
        dispatchPointerEvent("pointerdown", leftElement);
      });
      expect(onPointerDown).toHaveBeenCalledTimes(1);
      expect(onDragging).toHaveBeenCalledTimes(1);
      expect(onDragging).toHaveBeenCalledWith(true);
      expect(onPointerUp).not.toHaveBeenCalled();

      act(() => {
        dispatchPointerEvent("pointerup", leftElement);
      });
      expect(onPointerDown).toHaveBeenCalledTimes(1);
      expect(onDragging).toHaveBeenCalledTimes(2);
      expect(onDragging).toHaveBeenCalledWith(false);
      expect(onPointerUp).toHaveBeenCalledTimes(1);
    });

    it("should fire on-click if not dragged", () => {
      const onClick = jest.fn();
      const onDragging = jest.fn();

      const { leftElement } = setupMockedGroup({
        leftProps: { onClick, onDragging },
      });

      act(() => {
        dispatchPointerEvent("pointermove", leftElement);
      });
      expect(onDragging).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();

      act(() => {
        dispatchPointerEvent("pointerdown", leftElement);
      });
      expect(onDragging).toHaveBeenCalledTimes(1);
      expect(onDragging).toHaveBeenCalledWith(true);
      expect(onClick).not.toHaveBeenCalled();

      act(() => {
        dispatchPointerEvent("pointerup", leftElement);
      });
      expect(onDragging).toHaveBeenCalledTimes(2);
      expect(onDragging).toHaveBeenCalledWith(false);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should not fire on-click if dragged", () => {
      const onClick = jest.fn();
      const onDragging = jest.fn();

      const { leftElement } = setupMockedGroup({
        leftProps: { onClick, onDragging },
      });

      act(() => {
        dispatchPointerEvent("pointermove", leftElement);
      });
      expect(onDragging).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();

      act(() => {
        dispatchPointerEvent("pointerdown", leftElement);
      });
      expect(onDragging).toHaveBeenCalledTimes(1);
      expect(onDragging).toHaveBeenCalledWith(true);
      expect(onClick).not.toHaveBeenCalled();

      act(() => {
        dispatchPointerEvent("pointermove", leftElement);
      });
      expect(onDragging).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();

      act(() => {
        dispatchPointerEvent("pointerup", leftElement);
      });
      expect(onDragging).toHaveBeenCalledTimes(2);
      expect(onDragging).toHaveBeenCalledWith(false);
      expect(onClick).not.toHaveBeenCalled();
    });

    it("should only fire for the handle that has been dragged", () => {
      const onDraggingLeft = jest.fn();
      const onDraggingRight = jest.fn();

      const { leftElement } = setupMockedGroup({
        leftProps: { onDragging: onDraggingLeft },
        rightProps: { onDragging: onDraggingRight },
      });

      act(() => {
        dispatchPointerEvent("pointermove", leftElement);
      });
      expect(onDraggingLeft).not.toHaveBeenCalled();
      expect(onDraggingRight).not.toHaveBeenCalled();

      act(() => {
        dispatchPointerEvent("pointerdown", leftElement);
      });
      expect(onDraggingLeft).toHaveBeenCalledTimes(1);
      expect(onDraggingLeft).toHaveBeenCalledWith(true);
      expect(onDraggingRight).not.toHaveBeenCalled();

      act(() => {
        dispatchPointerEvent("pointerup", leftElement);
      });
      expect(onDraggingLeft).toHaveBeenCalledTimes(2);
      expect(onDraggingLeft).toHaveBeenCalledWith(false);
      expect(onDraggingRight).not.toHaveBeenCalled();
    });
  });

  describe("data attributes", () => {
    it("should initialize with the correct props based attributes", () => {
      const { leftElement, rightElement } = setupMockedGroup();

      verifyAttribute(leftElement, "data-panel-group-id", "test-group");
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.root, "");
      verifyAttribute(leftElement, "data-panel-group-direction", "horizontal");
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.enabled, "true");
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.id, "handle-left");

      verifyAttribute(rightElement, "data-panel-group-id", "test-group");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.root, "");
      verifyAttribute(rightElement, "data-panel-group-direction", "horizontal");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.enabled, "true");
      verifyAttribute(
        rightElement,
        RESIZE_HANDLE_ATTRIBUTES.id,
        "handle-right"
      );
    });

    it(`should update ${RESIZE_HANDLE_ATTRIBUTES.active} and ${RESIZE_HANDLE_ATTRIBUTES.state} when dragging starts/stops`, () => {
      const { leftElement, rightElement } = setupMockedGroup();
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.state, "inactive");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.state, "inactive");

      act(() => {
        dispatchPointerEvent("pointermove", leftElement);
      });
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.state, "hover");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.state, "inactive");

      act(() => {
        dispatchPointerEvent("pointerdown", leftElement);
      });
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.active, "pointer");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.state, "drag");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.state, "inactive");

      act(() => {
        dispatchPointerEvent("pointermove", leftElement);
      });
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.active, "pointer");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.state, "drag");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.state, "inactive");

      act(() => {
        dispatchPointerEvent("pointerup", leftElement);
      });
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.state, "hover");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.state, "inactive");

      act(() => {
        dispatchPointerEvent("pointermove", rightElement);
      });
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.state, "inactive");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.state, "hover");
    });

    it(`should update ${RESIZE_HANDLE_ATTRIBUTES.active} when focused`, () => {
      const { leftElement, rightElement } = setupMockedGroup();
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.active, null);

      act(() => {
        leftElement.focus();
      });
      expect(document.activeElement).toBe(leftElement);
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.active, "keyboard");
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.active, null);

      act(() => {
        leftElement.blur();
      });
      expect(document.activeElement).not.toBe(leftElement);
      verifyAttribute(leftElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
      verifyAttribute(rightElement, RESIZE_HANDLE_ATTRIBUTES.active, null);
    });
  });

  describe("a11y", () => {
    it("should pass explicit id prop to DOM", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel />
            <PanelResizeHandle id="explicit-id" />
            <Panel />
          </PanelGroup>
        );
      });

      const element = container.querySelector(
        `[${RESIZE_HANDLE_ATTRIBUTES.root}]`
      );

      expect(element).not.toBeNull();
      expect(element?.getAttribute("id")).toBe("explicit-id");
    });

    it("should not pass auto-generated id prop to DOM", () => {
      act(() => {
        root.render(
          <PanelGroup direction="horizontal">
            <Panel />
            <PanelResizeHandle />
            <Panel />
          </PanelGroup>
        );
      });

      const element = container.querySelector(
        `[${RESIZE_HANDLE_ATTRIBUTES.root}]`
      );

      expect(element).not.toBeNull();
      expect(element?.getAttribute("id")).toBeNull();
    });
  });

  it("resets the global cursor style on unmount", () => {
    const onDraggingLeft = jest.fn();

    const { leftElement } = setupMockedGroup({
      leftProps: { onDragging: onDraggingLeft },
      rightProps: {},
    });

    act(() => {
      dispatchPointerEvent("pointermove", leftElement);
    });

    act(() => {
      dispatchPointerEvent("pointerdown", leftElement);
    });
    expect(onDraggingLeft).toHaveBeenCalledTimes(1);
    expect(onDraggingLeft).toHaveBeenCalledWith(true);

    expect(cursorUtils.resetGlobalCursorStyle).not.toHaveBeenCalled();
    expect(cursorUtils.setGlobalCursorStyle).toHaveBeenCalled();

    onDraggingLeft.mockReset();

    act(() => {
      dispatchPointerEvent("pointermove", leftElement);
    });
    expect(onDraggingLeft).not.toHaveBeenCalled();

    act(() => {
      dispatchPointerEvent("pointerup", leftElement);
    });
    expect(onDraggingLeft).toHaveBeenCalledTimes(1);
    expect(onDraggingLeft).toHaveBeenCalledWith(false);

    onDraggingLeft.mockReset();

    act(() => {
      dispatchPointerEvent("pointermove", leftElement);
    });
    expect(onDraggingLeft).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });

    expect(cursorUtils.resetGlobalCursorStyle).toHaveBeenCalled();
  });
});

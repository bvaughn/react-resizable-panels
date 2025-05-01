import { Root, createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  type PanelResizeHandleProps,
} from ".";
import { DATA_ATTRIBUTES } from "./constants";
import { assert } from "./utils/assert";
import * as cursorUtils from "./utils/cursor";
import { getResizeHandleElement } from "./utils/dom/getResizeHandleElement";
import {
  dispatchPointerEvent,
  mockBoundingClientRect,
  verifyAttribute,
} from "./utils/test-utils";

vi.mock("./utils/cursor", () => ({
  getCursorStyle: vi.fn(),
  resetGlobalCursorStyle: vi.fn(),
  setGlobalCursorStyle: vi.fn(),
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

    vi.spyOn(console, "warn").mockImplementation((actualMessage: string) => {
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
    vi.clearAllMocks();
    vi.resetModules();

    act(() => {
      root.unmount();
    });

    expect(expectedWarnings).toHaveLength(0);
  });

  test("should support ...rest attributes", () => {
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
    test("should fire when dragging starts/stops", () => {
      const onDragging = vi.fn();
      const onPointerDown = vi.fn();
      const onPointerUp = vi.fn();

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

    test("should fire on-click if not dragged", () => {
      const onClick = vi.fn();
      const onDragging = vi.fn();

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

    test("should not fire on-click if dragged", () => {
      const onClick = vi.fn();
      const onDragging = vi.fn();

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

    test("should only fire for the handle that has been dragged", () => {
      const onDraggingLeft = vi.fn();
      const onDraggingRight = vi.fn();

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
    test("should initialize with the correct props based attributes", () => {
      const { leftElement, rightElement } = setupMockedGroup();

      verifyAttribute(leftElement, DATA_ATTRIBUTES.groupId, "test-group");
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandle, "");
      verifyAttribute(
        leftElement,
        DATA_ATTRIBUTES.groupDirection,
        "horizontal"
      );
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleEnabled, "true");
      verifyAttribute(
        leftElement,
        DATA_ATTRIBUTES.resizeHandleId,
        "handle-left"
      );

      verifyAttribute(rightElement, DATA_ATTRIBUTES.groupId, "test-group");
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandle, "");
      verifyAttribute(
        rightElement,
        DATA_ATTRIBUTES.groupDirection,
        "horizontal"
      );
      verifyAttribute(
        rightElement,
        DATA_ATTRIBUTES.resizeHandleEnabled,
        "true"
      );
      verifyAttribute(
        rightElement,
        DATA_ATTRIBUTES.resizeHandleId,
        "handle-right"
      );
    });

    test(`should update ${DATA_ATTRIBUTES.resizeHandleActive} and ${DATA_ATTRIBUTES.resizeHandleState} when dragging starts/stops`, () => {
      const { leftElement, rightElement } = setupMockedGroup();
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(
        leftElement,
        DATA_ATTRIBUTES.resizeHandleState,
        "inactive"
      );
      verifyAttribute(
        rightElement,
        DATA_ATTRIBUTES.resizeHandleState,
        "inactive"
      );

      act(() => {
        dispatchPointerEvent("pointermove", leftElement);
      });
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleState, "hover");
      verifyAttribute(
        rightElement,
        DATA_ATTRIBUTES.resizeHandleState,
        "inactive"
      );

      act(() => {
        dispatchPointerEvent("pointerdown", leftElement);
      });
      verifyAttribute(
        leftElement,
        DATA_ATTRIBUTES.resizeHandleActive,
        "pointer"
      );
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleState, "drag");
      verifyAttribute(
        rightElement,
        DATA_ATTRIBUTES.resizeHandleState,
        "inactive"
      );

      act(() => {
        dispatchPointerEvent("pointermove", leftElement);
      });
      verifyAttribute(
        leftElement,
        DATA_ATTRIBUTES.resizeHandleActive,
        "pointer"
      );
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleState, "drag");
      verifyAttribute(
        rightElement,
        DATA_ATTRIBUTES.resizeHandleState,
        "inactive"
      );

      act(() => {
        dispatchPointerEvent("pointerup", leftElement);
      });
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleState, "hover");
      verifyAttribute(
        rightElement,
        DATA_ATTRIBUTES.resizeHandleState,
        "inactive"
      );

      act(() => {
        dispatchPointerEvent("pointermove", rightElement);
      });
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(
        leftElement,
        DATA_ATTRIBUTES.resizeHandleState,
        "inactive"
      );
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleState, "hover");
    });

    test(`should update ${DATA_ATTRIBUTES.resizeHandleActive} when focused`, () => {
      const { leftElement, rightElement } = setupMockedGroup();
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleActive, null);

      act(() => {
        leftElement.focus();
      });
      expect(document.activeElement).toBe(leftElement);
      verifyAttribute(
        leftElement,
        DATA_ATTRIBUTES.resizeHandleActive,
        "keyboard"
      );
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleActive, null);

      act(() => {
        leftElement.blur();
      });
      expect(document.activeElement).not.toBe(leftElement);
      verifyAttribute(leftElement, DATA_ATTRIBUTES.resizeHandleActive, null);
      verifyAttribute(rightElement, DATA_ATTRIBUTES.resizeHandleActive, null);
    });
  });

  describe("a11y", () => {
    test("should pass explicit id prop to DOM", () => {
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
        `[${DATA_ATTRIBUTES.resizeHandle}]`
      );

      expect(element).not.toBeNull();
      expect(element?.getAttribute("id")).toBe("explicit-id");
    });

    test("should not pass auto-generated id prop to DOM", () => {
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
        `[${DATA_ATTRIBUTES.resizeHandle}]`
      );

      expect(element).not.toBeNull();
      expect(element?.getAttribute("id")).toBeNull();
    });
  });

  test("resets the global cursor style on unmount", () => {
    const onDraggingLeft = vi.fn();

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

import { afterEach, describe, expect, test, vi } from "vitest";
import { mountAxis } from "../mountAxis";
import {
  getInteractionState,
  subscribeToInteractionState,
  updateInteractionState
} from "../mutable-state/interactions";
import { mockGroup } from "../test/mockGroup";
import { onDocumentPointerMove } from "./onDocumentPointerMove";

describe("onDocumentPointerMove", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;

    updateInteractionState({
      state: "inactive",
      cursorFlags: 0
    });
  });

  function setup() {
    const group = mockGroup(new DOMRect(0, 0, 200, 100));
    group.addPanel(new DOMRect(0, 0, 100, 100), "a");
    group.addSeparator(new DOMRect(100, 0, 0, 100), "separator");
    group.addPanel(new DOMRect(100, 0, 100, 100), "b");

    document.body.appendChild(group.element);
    const unmount = mountAxis(group);

    const onChange = vi.fn();
    const unsubscribe = subscribeToInteractionState(onChange);

    cleanup = () => {
      unsubscribe();
      unmount();
      group.element.remove();
    };

    return { group, onChange };
  }

  function mockEvent(clientX: number, clientY: number = 50) {
    return {
      buttons: 0,
      clientX,
      clientY,
      currentTarget: document,
      defaultPrevented: false,
      pointerId: 1,
      pointerType: "mouse",
      target: document.body
    } as unknown as PointerEvent;
  }

  test("should not update interaction state while hovering the same hit regions", () => {
    const { onChange } = setup();

    onDocumentPointerMove(mockEvent(100));
    expect(getInteractionState().state).toBe("hover");
    expect(onChange).toHaveBeenCalledTimes(1);

    const hoverState = getInteractionState();

    // Moving within the same hit region should not emit a change
    onDocumentPointerMove(mockEvent(102));
    onDocumentPointerMove(mockEvent(98, 25));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(getInteractionState()).toBe(hoverState);

    // Leaving the hit region should
    onDocumentPointerMove(mockEvent(50));
    expect(getInteractionState().state).toBe("inactive");
    expect(onChange).toHaveBeenCalledTimes(2);

    // As should re-entering it
    onDocumentPointerMove(mockEvent(100));
    expect(getInteractionState().state).toBe("hover");
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  test("should not update interaction state while the pointer is not near any group", () => {
    const { onChange } = setup();

    onDocumentPointerMove(mockEvent(500, 500));
    onDocumentPointerMove(mockEvent(600, 500));
    expect(getInteractionState().state).toBe("inactive");
    expect(onChange).not.toHaveBeenCalled();
  });

  test("should update interaction state when the hovered hit regions change", () => {
    const group = mockGroup(new DOMRect(0, 0, 300, 100));
    group.addPanel(new DOMRect(0, 0, 100, 100), "a");
    group.addSeparator(new DOMRect(100, 0, 0, 100), "first");
    group.addPanel(new DOMRect(100, 0, 100, 100), "b");
    group.addSeparator(new DOMRect(200, 0, 0, 100), "second");
    group.addPanel(new DOMRect(200, 0, 100, 100), "c");

    document.body.appendChild(group.element);
    const unmount = mountAxis(group);
    cleanup = () => {
      unmount();
      group.element.remove();
    };

    onDocumentPointerMove(mockEvent(100));

    let state = getInteractionState();
    expect(state.state).toBe("hover");
    expect(
      state.state === "hover" && state.hitRegions[0].separator?.id
    ).toMatch(/first$/);

    onDocumentPointerMove(mockEvent(200));

    state = getInteractionState();
    expect(state.state).toBe("hover");
    expect(
      state.state === "hover" && state.hitRegions[0].separator?.id
    ).toMatch(/second$/);
  });
});

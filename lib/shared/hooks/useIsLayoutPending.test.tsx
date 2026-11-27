// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Group, Panel } from "../../index";
import { setElementBoundsFunction } from "../utils/test/mockBoundingClientRect";
import { useIsLayoutPending } from "./useIsLayoutPending";

const IDS = ["group"];

let renderCount = 0;

function Status() {
  renderCount++;
  return (
    <div data-testid="status">
      {useIsLayoutPending(IDS) ? "pending" : "idle"}
    </div>
  );
}

function TestGroup() {
  return (
    <>
      <Group id="group">
        <Panel id="left" />
        <Panel id="right" />
      </Group>
      <Status />
    </>
  );
}

describe("useIsLayoutPending", () => {
  beforeEach(() => {
    setElementBoundsFunction((element) =>
      element.id === "group"
        ? new DOMRect(0, 0, 100, 50)
        : new DOMRect(0, 0, 50, 50)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("becomes idle after the layout has been applied", async () => {
    const { findByText, getByTestId } = render(<TestGroup />);
    expect(getByTestId("status").textContent).toBe("pending");

    await findByText("idle");
  });

  test("cancels its pending frames when unmounted", async () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextId = 1;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      const id = nextId++;
      callbacks.set(id, callback);
      return id;
    });
    const cancelFrame = vi
      .spyOn(window, "cancelAnimationFrame")
      .mockImplementation((id) => {
        callbacks.delete(id);
      });

    const { getByTestId, unmount } = render(<TestGroup />);
    await vi.waitFor(() => expect(callbacks.size).toBeGreaterThan(0));
    expect(getByTestId("status").textContent).toBe("pending");

    // The Group uses the hook too, so it has a pending frame of its own
    const pendingIds = [...callbacks.keys()];
    const renderCountBefore = renderCount;

    unmount();

    for (const id of pendingIds) {
      expect(cancelFrame).toHaveBeenCalledWith(id);
    }

    await act(async () => {
      callbacks.forEach((callback) => callback(0));
    });
    expect(renderCount).toBe(renderCountBefore);
  });

  let iframe: HTMLIFrameElement | undefined;

  afterEach(() => {
    cleanup();
    iframe?.remove();
    iframe = undefined;
  });

  test("requests frames from the window of the axis' own document", async () => {
    iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    const win = iframe.contentWindow!;

    const callbacks: FrameRequestCallback[] = [];
    const requestFrame = vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    });
    (win as unknown as Window & typeof globalThis).ResizeObserver =
      window.ResizeObserver;
    // The mocked sizes are installed on this window's elements; share them with the iframe's
    for (const name of [
      "getBoundingClientRect",
      "offsetWidth",
      "offsetHeight"
    ]) {
      Object.defineProperty(
        (win as unknown as Window & typeof globalThis).HTMLElement.prototype,
        name,
        Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)!
      );
    }
    win.requestAnimationFrame = requestFrame;
    win.cancelAnimationFrame = vi.fn();
    const ownerRequestFrame = vi.spyOn(window, "requestAnimationFrame");

    const container = win.document.createElement("div");
    win.document.body.appendChild(container);

    const { getByTestId } = render(<TestGroup />, { container });

    await vi.waitFor(() => expect(requestFrame).toHaveBeenCalled());
    expect(getByTestId("status").textContent).toBe("pending");

    for (let attempt = 0; attempt < 5; attempt++) {
      await act(async () => {
        callbacks.splice(0).forEach((callback) => callback(0));
      });
    }

    expect(getByTestId("status").textContent).toBe("idle");
    expect(ownerRequestFrame).not.toHaveBeenCalled();
  });
});

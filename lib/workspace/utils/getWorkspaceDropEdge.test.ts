import { afterEach, describe, expect, test } from "vitest";
import { getWorkspaceDropEdge } from "./getWorkspaceDropEdge";

describe("getWorkspaceDropEdge", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  // An 800x600 workspace at (100, 50), with a 2px border and optional padding around its layout
  function setup({ padding = 0 }: { padding?: number } = {}) {
    const container = document.createElement("div");
    container.innerHTML = `
      <div data-workspace>
        <div data-workspace-layout>
          <div data-tabset-id="a">
            <div data-tabset-header><div data-tab-list></div></div>
            <div data-tab-panels></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(container);
    cleanup = () => container.remove();

    const rootElement =
      container.querySelector<HTMLElement>("[data-workspace]")!;
    const layoutElement = container.querySelector<HTMLElement>(
      "[data-workspace-layout]"
    )!;

    const border = 2;
    rootElement.style.border = `${border}px solid`;
    rootElement.getBoundingClientRect = () => new DOMRect(100, 50, 800, 600);
    const inset = border + padding;
    layoutElement.getBoundingClientRect = () =>
      new DOMRect(100 + inset, 50 + inset, 800 - inset * 2, 600 - inset * 2);

    const getEdge = (
      clientX: number,
      clientY: number,
      part: "header" | "panels" = "panels"
    ) =>
      getWorkspaceDropEdge({
        clientX,
        clientY,
        element: container.querySelector(
          part === "header" ? "[data-tab-list]" : "[data-tab-panels]"
        )!,
        layoutElement,
        rootElement
      });

    return { getEdge };
  }

  test("targets the sides and bottom within a few pixels of the edges of the layout", () => {
    const { getEdge } = setup();

    expect(getEdge(110, 300)).toBe("left");
    expect(getEdge(890, 300)).toBe("right");
    expect(getEdge(500, 640)).toBe("bottom");

    // Further in
    expect(getEdge(130, 300)).toBeUndefined();
    expect(getEdge(500, 300)).toBeUndefined();
  });

  test("only targets the top within the root's padding", () => {
    expect(setup().getEdge(500, 55)).toBeUndefined();
    cleanup?.();

    expect(setup({ padding: 10 }).getEdge(500, 55)).toBe("top");
  });

  test("targets the root's padding", () => {
    const { getEdge } = setup({ padding: 10 });

    expect(getEdge(105, 300)).toBe("left");
    expect(getEdge(895, 300)).toBe("right");
    expect(getEdge(500, 645)).toBe("bottom");
  });

  test("doesn't target the root's border, or points outside of it", () => {
    const { getEdge } = setup({ padding: 10 });

    expect(getEdge(101, 300)).toBeUndefined();
    expect(getEdge(50, 300)).toBeUndefined();
  });

  test("doesn't target tabset headers within the layout", () => {
    const { getEdge } = setup({ padding: 10 });

    expect(getEdge(120, 300, "header")).toBeUndefined();
    // The root's padding beside a header is still an edge
    expect(getEdge(105, 300, "header")).toBe("left");
  });

  test("targets the edge a corner point is furthest past", () => {
    const { getEdge } = setup({ padding: 10 });

    // 7px left of the layout, and 5px above it
    expect(getEdge(105, 57)).toBe("left");
    // 3px left of the layout, and 8px above it
    expect(getEdge(109, 54)).toBe("top");
  });
});

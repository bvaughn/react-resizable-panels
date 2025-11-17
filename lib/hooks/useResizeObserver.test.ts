import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import { simulateUnsupportedEnvironmentForTest } from "../utils/test/mockResizeObserver";
import {
  setDefaultElementBounds,
  setElementBounds
} from "../utils/test/mockBoundingClientRect";
import { useResizeObserver } from "./useResizeObserver";

describe("useResizeObserver", () => {
  beforeEach(() => {
    setDefaultElementBounds(new DOMRect(0, 0, 50, 100));
  });

  test("should use default width/height if disabled", () => {
    simulateUnsupportedEnvironmentForTest();

    const element = document.createElement("div");

    const { result, unmount } = renderHook(() =>
      useResizeObserver({
        defaultHeight: 50,
        defaultWidth: 50,
        element,
        disabled: true,
        style: undefined
      })
    );

    // Initial size on mount should be ignored
    expect(result.current).toEqual({
      height: 50,
      width: 50
    });

    act(() => {
      // Updates should be ignored as well
      setElementBounds(element, new DOMRect(0, 0, 50, 25));
    });

    expect(result.current).toEqual({
      height: 50,
      width: 50
    });

    unmount();
  });

  test("should update on mount with the measured dimensions", () => {
    const element = document.createElement("div");

    const { result, unmount } = renderHook(() =>
      useResizeObserver({
        element,
        style: undefined
      })
    );

    expect(result.current).toEqual({
      height: 100,
      width: 50
    });

    unmount();
  });

  test("should update when dimensions change", () => {
    const element = document.createElement("div");

    const { result, unmount } = renderHook(() =>
      useResizeObserver({
        element,
        style: undefined
      })
    );

    expect(result.current).toEqual({
      height: 100,
      width: 50
    });

    act(() => {
      setElementBounds(element, new DOMRect(0, 0, 50, 50));
    });

    expect(result.current).toEqual({
      height: 50,
      width: 50
    });

    unmount();
  });

  test("should ignore resize events from other elements", () => {
    const otherElement = document.createElement("div");

    const { result, unmount } = renderHook(() =>
      useResizeObserver({
        element: document.createElement("div"),
        style: undefined
      })
    );

    act(() => {
      setElementBounds(otherElement, new DOMRect(0, 0, 50, 50));
    });

    expect(result.current).toEqual({
      height: 100,
      width: 50
    });

    unmount();
  });

  describe("skip ResizeObserver", () => {
    test("if an explicit pixel height is specified", () => {
      simulateUnsupportedEnvironmentForTest();

      const element = document.createElement("div");

      const { result } = renderHook(() =>
        useResizeObserver({
          element,
          mode: "only-height",
          style: {
            height: "25px"
          }
        })
      );

      expect(result.current).toEqual({
        height: 25,
        width: undefined
      });
    });

    test("if an explicit pixel width is specified", () => {
      simulateUnsupportedEnvironmentForTest();

      const element = document.createElement("div");

      const { result } = renderHook(() =>
        useResizeObserver({
          element,
          mode: "only-width",
          style: {
            width: "15px"
          }
        })
      );

      expect(result.current).toEqual({
        height: undefined,
        width: 15
      });
    });

    test("if an explicit pixel width and height are specified", () => {
      simulateUnsupportedEnvironmentForTest();

      const element = document.createElement("div");

      const { result } = renderHook(() =>
        useResizeObserver({
          element,
          style: {
            height: "25px",
            width: "15px"
          }
        })
      );

      expect(result.current).toEqual({
        height: 25,
        width: 15
      });
    });
  });
});

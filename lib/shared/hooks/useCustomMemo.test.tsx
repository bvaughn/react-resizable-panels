// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useCustomMemo } from "./useCustomMemo";

function useArrayMemo(array: number[]) {
  return useCustomMemo(
    () => array,
    [array],
    ([prev], [next]) => JSON.stringify(prev) === JSON.stringify(next)
  );
}

describe("useCustomMemo", () => {
  test("should return the memoized value while the dependencies are equal", () => {
    const initial = [1, 2];
    const { rerender, result } = renderHook(useArrayMemo, {
      initialProps: initial
    });

    rerender([1, 2]);

    expect(result.current).toBe(initial);
  });

  test("should recompute the value once the dependencies change", () => {
    const { rerender, result } = renderHook(useArrayMemo, {
      initialProps: [1, 2]
    });

    const next = [1, 3];
    rerender(next);

    expect(result.current).toBe(next);
  });

  test("should only call the factory when the dependencies change", () => {
    const factory = vi.fn(() => ({}));
    const { rerender } = renderHook(
      ({ value }) =>
        useCustomMemo(factory, [value], ([prev], [next]) => prev === next),
      { initialProps: { value: 1 } }
    );
    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ value: 1 });
    expect(factory).toHaveBeenCalledTimes(1);

    rerender({ value: 2 });
    expect(factory).toHaveBeenCalledTimes(2);
  });
});

import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useId } from "./useId";

describe("useId", () => {
  test("should prefer explicit id", () => {
    const { result } = renderHook(() => useId("abc"));

    expect(result.current).toBe("abc");
  });

  test("should fallback ot React useId", () => {
    vi.mock(import("react"), async (importOriginal) => {
      const original = await importOriginal();

      return {
        ...original,
        useId: vi.fn(() => `:r123:`)
      };
    });

    const { result } = renderHook(() => useId(undefined));

    expect(result.current).toBe(":r123:");
  });
});

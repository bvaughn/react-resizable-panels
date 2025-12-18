import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { LayoutStorage } from "./types";
import { useDefaultLayout } from "./useDefaultLayout";

describe("useDefaultLayout", () => {
  test("should read/write from the provided Storage API", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn()
    };

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "foo",
        storage
      })
    );

    expect(result.current.defaultLayout).toMatchInlineSnapshot(`undefined`);
    expect(storage.getItem).toHaveBeenCalled();
    expect(storage.getItem).toHaveBeenCalledWith("react-resizable-panels:foo");
    expect(storage.setItem).not.toHaveBeenCalled();

    result.current.onLayoutChange({
      bar: 35,
      baz: 65
    });
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      "react-resizable-panels:foo",
      JSON.stringify({
        bar: 35,
        baz: 65
      })
    );
  });
});

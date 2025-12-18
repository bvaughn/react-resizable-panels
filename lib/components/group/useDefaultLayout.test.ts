import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDefaultLayout } from "./useDefaultLayout";
import type { LayoutStorage } from "./types";

describe("useDefaultLayout", () => {
  it("should return layout when panelIds match", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => JSON.stringify({ left: 50, right: 50 })),
      setItem: vi.fn()
    };

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test",
        storage,
        panelIds: ["left", "right"]
      })
    );

    expect(result.current.defaultLayout).toEqual({ left: 50, right: 50 });
  });

  it("should ignore layout when panelIds don't match (count mismatch)", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => JSON.stringify({ left: 50, right: 50 })),
      setItem: vi.fn()
    };

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test",
        storage,
        panelIds: ["left", "middle", "right"]
      })
    );

    expect(result.current.defaultLayout).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Ignoring saved layout")
    );

    consoleWarnSpy.mockRestore();
  });

  it("should ignore layout when panelIds don't match (different IDs)", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => JSON.stringify({ left: 50, right: 50 })),
      setItem: vi.fn()
    };

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test",
        storage,
        panelIds: ["left", "center"]
      })
    );

    expect(result.current.defaultLayout).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Ignoring saved layout")
    );

    consoleWarnSpy.mockRestore();
  });

  it("should work without panelIds for backward compatibility", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => JSON.stringify({ left: 50, right: 50 })),
      setItem: vi.fn()
    };

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test",
        storage
      })
    );

    // Without panelIds, no validation occurs
    expect(result.current.defaultLayout).toEqual({ left: 50, right: 50 });
  });

  it("should return undefined when no layout is saved", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn()
    };

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test",
        storage,
        panelIds: ["left", "right"]
      })
    );

    expect(result.current.defaultLayout).toBeUndefined();
  });

  it("should save layout when panelIds match", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn()
    };

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test",
        storage,
        panelIds: ["left", "right"]
      })
    );

    const newLayout = { left: 60, right: 40 };
    result.current.onLayoutChange(newLayout);

    expect(storage.setItem).toHaveBeenCalledWith(
      "react-resizable-panels:test",
      JSON.stringify(newLayout)
    );
  });

  it("should not save layout when panelIds don't match", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn()
    };

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test",
        storage,
        panelIds: ["left", "right"]
      })
    );

    // Try to save layout with different panel IDs
    const wrongLayout = { left: 33, middle: 34, right: 33 };
    result.current.onLayoutChange(wrongLayout);

    expect(storage.setItem).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Not saving layout")
    );

    consoleWarnSpy.mockRestore();
  });

  it("should sort panelIds for comparison (order independence)", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => JSON.stringify({ a: 30, b: 30, c: 40 })),
      setItem: vi.fn()
    };

    // Panel IDs in different order should still match
    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test",
        storage,
        panelIds: ["c", "a", "b"] // Different order from saved layout
      })
    );

    expect(result.current.defaultLayout).toEqual({ a: 30, b: 30, c: 40 });
  });

  it("should handle JSON parse errors gracefully", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => "invalid json"),
      setItem: vi.fn()
    };

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test",
        storage,
        panelIds: ["left", "right"]
      })
    );

    expect(result.current.defaultLayout).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});

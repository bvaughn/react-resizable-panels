import { render, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { setDefaultElementBounds } from "../../utils/test/mockBoundingClientRect";
import { Panel } from "../panel/Panel";
import { Group } from "./Group";
import { type GroupImperativeHandle, type LayoutStorage } from "./types";
import { useDefaultLayout } from "./useDefaultLayout";

describe("useDefaultLayout", () => {
  test("should read/write from the provided Storage API", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn()
    };

    const { result } = renderHook(() =>
      useDefaultLayout({
        debounceSaveMs: 0,
        id: "test-group-id",
        storage
      })
    );

    expect(result.current.defaultLayout).toMatchInlineSnapshot(`undefined`);
    expect(storage.getItem).toHaveBeenCalled();
    expect(storage.getItem).toHaveBeenCalledWith(
      "react-resizable-panels:test-group-id"
    );
    expect(storage.setItem).not.toHaveBeenCalled();

    result.current.onLayoutChange({
      bar: 35,
      baz: 65
    });
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      "react-resizable-panels:test-group-id",
      JSON.stringify({
        bar: 35,
        baz: 65
      })
    );
  });

  test("should support debounced write", () => {
    vi.useFakeTimers();

    const storage: LayoutStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn()
    };

    const { result } = renderHook(() =>
      useDefaultLayout({
        debounceSaveMs: 150,
        id: "test-group-id",
        storage
      })
    );

    expect(result.current.defaultLayout).toMatchInlineSnapshot(`undefined`);
    expect(storage.setItem).not.toHaveBeenCalled();

    result.current.onLayoutChange({
      bar: 35,
      baz: 65
    });
    expect(storage.setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(149);
    expect(storage.setItem).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      "react-resizable-panels:test-group-id",
      JSON.stringify({
        bar: 35,
        baz: 65
      })
    );
  });

  // See github.com/bvaughn/react-resizable-panels/pull/540
  describe("should ignore temporarily invalid layouts", () => {
    test("on mount (ids mismatch)", () => {
      const groupRef = createRef<GroupImperativeHandle>();

      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

      render(
        <Group
          defaultLayout={{
            left: 20,
            right: 50
          }}
          groupRef={groupRef}
        >
          <Panel id="before" />
          <Panel id="after" />
        </Group>
      );

      expect(groupRef.current?.getLayout()).toMatchInlineSnapshot(`
      {
        "after": 50,
        "before": 50,
      }
    `);
    });

    test("on mount (num panels mismatch)", () => {
      const groupRef = createRef<GroupImperativeHandle>();

      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

      render(
        <Group
          defaultLayout={{
            left: 20,
            middle: 30,
            right: 50
          }}
          groupRef={groupRef}
        >
          <Panel id="left" />
          <Panel id="right" />
        </Group>
      );

      expect(groupRef.current?.getLayout()).toMatchInlineSnapshot(`
      {
        "left": 50,
        "right": 50,
      }
    `);
    });

    test("after update (num panels mismatch)", () => {
      const groupRef = createRef<GroupImperativeHandle>();

      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

      const { rerender } = render(
        <Group
          defaultLayout={{
            left: 20,
            middle: 30,
            right: 50
          }}
          groupRef={groupRef}
        >
          <Panel id="left" />
          <Panel id="middle" />
          <Panel id="right" />
        </Group>
      );

      expect(groupRef.current?.getLayout()).toMatchInlineSnapshot(`
      {
        "left": 20,
        "middle": 30,
        "right": 50,
      }
    `);

      rerender(
        <Group
          defaultLayout={{
            left: 20,
            middle: 30,
            right: 50
          }}
          groupRef={groupRef}
        >
          <Panel id="left">left</Panel>
          <Panel id="right">right</Panel>
        </Group>
      );

      expect(groupRef.current?.getLayout()).toMatchInlineSnapshot(`
      {
        "left": 50,
        "right": 50,
      }
    `);
    });
  });

  test("should save separate layouts per panel group when panelIds param is present", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn()
    };

    const { result } = renderHook(() =>
      useDefaultLayout({
        debounceSaveMs: 0,
        id: "test-group-id",
        panelIds: ["foo", "bar"],
        storage
      })
    );

    expect(result.current.defaultLayout).toMatchInlineSnapshot(`undefined`);
    expect(storage.getItem).toHaveBeenCalled();
    expect(storage.getItem).toHaveBeenCalledWith(
      "react-resizable-panels:test-group-id:foo:bar"
    );
    expect(storage.setItem).not.toHaveBeenCalled();

    result.current.onLayoutChange({
      foo: 35,
      bar: 65
    });
    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(storage.setItem).toHaveBeenCalledWith(
      "react-resizable-panels:test-group-id:foo:bar",
      JSON.stringify({
        foo: 35,
        bar: 65
      })
    );

    // This test verifies two things:
    // 1. Panel layout is saved separately
    // 2. Panel ids in the Layout are prioritized over those in the prop
    result.current.onLayoutChange({
      foo: 25,
      bar: 55,
      baz: 20
    });
    expect(storage.setItem).toHaveBeenCalledTimes(2);
    expect(storage.setItem).toHaveBeenCalledWith(
      "react-resizable-panels:test-group-id:foo:bar:baz",
      JSON.stringify({
        foo: 25,
        bar: 55,
        baz: 20
      })
    );
  });

  test("should ignore invalid layouts (panel ids mismatch)", () => {
    setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

    const groupRef = createRef<GroupImperativeHandle>();

    render(
      <Group
        defaultLayout={{
          foo: 40,
          bar: 60
        }}
        groupRef={groupRef}
      >
        <Panel id="bar" defaultSize="30%" />
        <Panel id="baz" />
      </Group>
    );

    expect(groupRef.current?.getLayout()).toMatchInlineSnapshot(`
      {
        "bar": 30,
        "baz": 70,
      }
    `);
  });
});

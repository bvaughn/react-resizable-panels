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
  test("should ignore invalid layouts (num panels mismatch)", () => {
    const groupRef = createRef<GroupImperativeHandle>();

    setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

    function Test({ hideMiddlePanel }: { hideMiddlePanel?: boolean }) {
      const { defaultLayout, onLayoutChange } = useDefaultLayout({
        debounceSaveMs: 0,
        id: "test-group-id",
        storage: localStorage
      });

      // Prime the local storage
      onLayoutChange({
        left: 20,
        middle: 30,
        right: 50
      });

      return (
        <Group
          defaultLayout={defaultLayout}
          groupRef={groupRef}
          onLayoutChange={onLayoutChange}
        >
          <Panel id="left">left</Panel>
          {!hideMiddlePanel && <Panel id="middle">middle</Panel>}
          <Panel id="right">right</Panel>
        </Group>
      );
    }

    const { rerender } = render(<Test />);

    expect(groupRef.current?.getLayout()).toMatchInlineSnapshot(`
      {
        "left": 20,
        "middle": 30,
        "right": 50,
      }
    `);

    rerender(<Test hideMiddlePanel />);

    expect(groupRef.current?.getLayout()).toMatchInlineSnapshot(`
      {
        "left": 50,
        "right": 50,
      }
    `);
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

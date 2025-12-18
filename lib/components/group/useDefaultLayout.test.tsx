import { render, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { Panel } from "../panel/Panel";
import { Group } from "./Group";
import type { GroupImperativeHandle, LayoutStorage } from "./types";
import { useDefaultLayout } from "./useDefaultLayout";

describe("useDefaultLayout", () => {
  test("should read/write from the provided Storage API", () => {
    const storage: LayoutStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn()
    };

    const { result } = renderHook(() =>
      useDefaultLayout({
        groupId: "test-group-id",
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

  // See github.com/bvaughn/react-resizable-panels/pull/540
  test("should not break when coupled with dynamic layouts", () => {
    const groupRef = createRef<GroupImperativeHandle>();

    function Test({ hideMiddlePanel }: { hideMiddlePanel?: boolean }) {
      const { defaultLayout, onLayoutChange } = useDefaultLayout({
        groupId: "test-group-id",
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
});

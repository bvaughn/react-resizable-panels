import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { initMutableGroup } from "../../../state/tests/initMutableGroup";
import { assert } from "../../../utils/assert";
import { useGroupImperativeHandle } from "./useGroupImperativeHandle";

describe("useGroupImperativeHandle", () => {
  describe("getLayout", () => {
    test("returns the group's current layout", () => {
      const group = initMutableGroup({
        defaultLayout: { a: 50, b: 50 },
        panels: [
          {
            id: "a"
          },
          { id: "b" }
        ]
      });

      const { result } = renderHook(() => useGroupImperativeHandle(group));

      assert(result.current);
      expect(result.current.getLayout()).toMatchInlineSnapshot(`
          {
            "a": 50,
            "b": 50,
          }
        `);
    });
  });

  describe("setLayout", () => {
    test("updates the group's layout", () => {
      const group = initMutableGroup({
        defaultLayout: { a: 50, b: 50 },
        panels: [
          {
            id: "a",
            minSize: "10%"
          },
          { id: "b" }
        ]
      });

      const { result } = renderHook(() => useGroupImperativeHandle(group));

      assert(result.current);
      expect(result.current.getLayout()).toMatchInlineSnapshot(`
          {
            "a": 50,
            "b": 50,
          }
        `);

      result.current.setLayout({
        a: 0,
        b: 100
      });
      expect(result.current.getLayout()).toMatchInlineSnapshot(`
          {
            "a": 10,
            "b": 90,
          }
        `);
    });
  });
});

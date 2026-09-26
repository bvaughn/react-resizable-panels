import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock
} from "vitest";
import { mountAxis } from "../mountAxis";
import { subscribeToMountedAxis } from "../mutable-state/axes";
import { mockGroup } from "../test/mockGroup";
import type { ResizeItemConstraints } from "../types";
import { getImperativeAxisMethods } from "./getImperativeAxisMethods";

describe("getImperativeAxisMethods", () => {
  let removeChangeListener: (() => void) | undefined = undefined;
  let unmountGroup: (() => void) | undefined = undefined;
  let onGroupChange: Mock;

  function init(
    panelConstraints: (Partial<ResizeItemConstraints> & {
      defaultSize: number;
    })[]
  ) {
    const group = mockGroup(new DOMRect(0, 0, 1000, 50), {
      id: "group",
      orientation: "horizontal"
    });

    panelConstraints.forEach((current) => {
      group.addPanel(
        new DOMRect(
          0,
          0,
          typeof current.defaultSize === "number"
            ? current.defaultSize
            : 1000 / panelConstraints.length,
          50
        ),
        current.itemId,
        current
      );
    });

    unmountGroup = mountAxis(group);

    removeChangeListener = subscribeToMountedAxis("group", onGroupChange);

    return {
      api: getImperativeAxisMethods({ axisId: group.id }),
      group
    };
  }

  beforeEach(() => {
    onGroupChange = vi.fn();
  });

  afterEach(() => {
    if (removeChangeListener) {
      removeChangeListener();
    }

    if (unmountGroup) {
      unmountGroup();
    }
  });

  describe("getLayout", () => {
    test("throws if group not mounted", () => {
      expect(() =>
        getImperativeAxisMethods({
          axisId: "group"
        }).getLayout()
      ).toThrowError('Could not find Group with id "group"');
    });

    test("returns the current group layout", () => {
      const { api } = init([
        { defaultSize: 200 },
        { defaultSize: 500 },
        { defaultSize: 300 }
      ]);

      expect(api.getLayout()).toMatchInlineSnapshot(`
        {
          "group-1": 20,
          "group-2": 50,
          "group-3": 30,
        }
      `);
    });
  });

  describe("setLayout", () => {
    test("matches constraints by panel ID regardless of layout key order", () => {
      const { api } = init([
        { defaultSize: 500, minSize: 400 },
        { defaultSize: 500 }
      ]);

      api.setLayout({ "group-2": 80, "group-1": 20 });

      expect(api.getLayout()).toEqual({ "group-1": 40, "group-2": 60 });
    });

    test("throws if group not mounted", () => {
      expect(() =>
        getImperativeAxisMethods({
          axisId: "group"
        }).setLayout({})
      ).toThrowError('Could not find Group with id "group"');
    });

    test("ignores a no-op layout update", () => {
      const { api } = init([{ defaultSize: 200 }, { defaultSize: 800 }]);
      api.setLayout({
        "group-1": 20,
        "group-2": 80
      });

      expect(onGroupChange).not.toHaveBeenCalled();
    });

    test("ignores an invalid layout update", () => {
      const { api } = init([
        { defaultSize: 200, minSize: 200 },
        { defaultSize: 800 }
      ]);
      api.setLayout({
        "group-1": 10,
        "group-2": 90
      });

      expect(onGroupChange).not.toHaveBeenCalled();
    });

    test("validates and updates the group layout", () => {
      const { api } = init([
        { defaultSize: 200, minSize: 100 },
        { defaultSize: 800 }
      ]);
      api.setLayout({
        "group-1": 0,
        "group-2": 100
      });

      expect(onGroupChange).toHaveBeenCalledTimes(1);
      expect(api.getLayout()).toMatchInlineSnapshot(`
        {
          "group-1": 10,
          "group-2": 90,
        }
      `);
    });

    test("allows disabled panels to be resized", () => {
      const { api } = init([
        { defaultSize: 200, disabled: true, minSize: 100 },
        { defaultSize: 800, disabled: true }
      ]);

      expect(api.getLayout()).toMatchInlineSnapshot(`
        {
          "group-1": 20,
          "group-2": 80,
        }
      `);

      api.setLayout({
        "group-1": 30,
        "group-2": 70
      });

      expect(onGroupChange).toHaveBeenCalledTimes(1);
      expect(api.getLayout()).toMatchInlineSnapshot(`
        {
          "group-1": 30,
          "group-2": 70,
        }
      `);
    });
  });
});

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock
} from "vitest";
import type { PanelConstraints } from "../../components/panel/types";
import { mountGroup } from "../mountGroup";
import { subscribeToMountedGroup } from "../mutable-state/groups";
import { mockGroup } from "../test/mockGroup";
import { getImperativeGroupMethods } from "./getImperativeGroupMethods";

describe("getImperativeGroupMethods", () => {
  let removeChangeListener: (() => void) | undefined = undefined;
  let unmountGroup: (() => void) | undefined = undefined;
  let onGroupChange: Mock;

  function init(
    panelConstraints: (Partial<PanelConstraints> & {
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
        current.panelId,
        current
      );
    });

    unmountGroup = mountGroup(group);

    removeChangeListener = subscribeToMountedGroup("group", onGroupChange);

    return {
      api: getImperativeGroupMethods({ groupId: group.id }),
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
        getImperativeGroupMethods({
          groupId: "group"
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
    test("throws if group not mounted", () => {
      expect(() =>
        getImperativeGroupMethods({
          groupId: "group"
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

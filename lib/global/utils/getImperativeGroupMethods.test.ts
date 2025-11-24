import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock
} from "vitest";
import { getImperativeGroupMethods } from "./getImperativeGroupMethods";
import type { PanelConstraintProps } from "../../components/panel/types";
import { mockGroup } from "../test/mockGroup";
import { mountGroup } from "../mountGroup";
import { eventEmitter } from "../mutableState";

describe("getImperativeGroupMethods", () => {
  let unmountGroup: (() => void) | undefined = undefined;
  let onMountedGroupsChange: Mock;

  function init(
    panelConstraints: (Partial<PanelConstraintProps> & {
      defaultSize: number;
    })[]
  ) {
    const group = mockGroup(new DOMRect(0, 0, 1000, 50), "horizontal", "A");

    panelConstraints.forEach((current) => {
      group.addChild(
        "panel",
        new DOMRect(
          0,
          0,
          typeof current.defaultSize === "number"
            ? current.defaultSize
            : 1000 / panelConstraints.length,
          50
        )
      );

      const panel = group.panels[group.panels.length - 1];
      panel.panelConstraints = {
        ...panel.panelConstraints,
        ...current
      };
    });

    unmountGroup = mountGroup(group);

    eventEmitter.addListener("mountedGroupsChange", onMountedGroupsChange);

    return {
      api: getImperativeGroupMethods({ groupId: group.id }),
      group
    };
  }

  beforeEach(() => {
    onMountedGroupsChange = vi.fn();
  });

  afterEach(() => {
    if (unmountGroup) {
      unmountGroup();
    }

    eventEmitter.removeListener("mountedGroupsChange", onMountedGroupsChange);
  });

  describe("getLayout", () => {
    test("throws if group not mounted", () => {
      expect(() =>
        getImperativeGroupMethods({
          groupId: "A"
        }).getLayout()
      ).toThrow("Group A not found");
    });

    test("returns the current group layout", () => {
      const { api } = init([
        { defaultSize: 200 },
        { defaultSize: 500 },
        { defaultSize: 300 }
      ]);

      expect(api.getLayout()).toMatchInlineSnapshot(`
        {
          "A-1": 20,
          "A-2": 50,
          "A-3": 30,
        }
      `);
    });
  });

  describe("setLayout", () => {
    test("throws if group not mounted", () => {
      expect(() =>
        getImperativeGroupMethods({
          groupId: "A"
        }).setLayout({})
      ).toThrow("Group A not found");
    });

    test("ignores a no-op layout update", () => {
      const { api } = init([{ defaultSize: 200 }, { defaultSize: 800 }]);
      api.setLayout({
        "A-1": 20,
        "A-2": 80
      });

      expect(onMountedGroupsChange).not.toHaveBeenCalled();
    });

    test("ignores an invalid layout update", () => {
      const { api } = init([
        { defaultSize: 200, minSize: 200 },
        { defaultSize: 800 }
      ]);
      api.setLayout({
        "A-1": 10,
        "A-2": 90
      });

      expect(onMountedGroupsChange).not.toHaveBeenCalled();
    });

    test("validates and updates the group layout", () => {
      const { api } = init([
        { defaultSize: 200, minSize: 100 },
        { defaultSize: 800 }
      ]);
      api.setLayout({
        "A-1": 0,
        "A-2": 100
      });

      expect(onMountedGroupsChange).toHaveBeenCalledTimes(1);
      expect(api.getLayout()).toMatchInlineSnapshot(`
        {
          "A-1": 10,
          "A-2": 90,
        }
      `);
    });
  });
});

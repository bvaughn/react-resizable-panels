import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock
} from "vitest";
import type {
  PanelConstraintProps,
  PanelImperativeHandle
} from "../../components/panel/types";
import { mountGroup } from "../mountGroup";
import { eventEmitter } from "../mutableState";
import { mockGroup } from "../test/mockGroup";
import { getImperativePanelMethods } from "./getImperativePanelMethods";

describe("getImperativePanelMethods", () => {
  test.each([
    ["collapse"],
    ["expand"],
    ["getSize"],
    ["isCollapsed"],
    ["resize"]
  ])("method %o: throws if group or panel not mounted", (name) => {
    const key = name as keyof PanelImperativeHandle;

    const group = mockGroup(new DOMRect(), "horizontal", "A");

    const api = getImperativePanelMethods({
      groupId: "A",
      panelId: "B"
    });

    expect(() => (key === "resize" ? api[key](1) : api[key]())).toThrow(
      "Group A not found"
    );

    const unmountGroup = mountGroup(group);

    expect(() => (key === "resize" ? api[key](1) : api[key]())).toThrow(
      /not found for Panel B/
    );

    unmountGroup();
  });

  describe("mounted", () => {
    let unmountGroup: (() => void) | undefined = undefined;
    let onMountedGroupsChange: Mock;

    function init(panelConstraints: Partial<PanelConstraintProps>[]) {
      const group = mockGroup(new DOMRect(0, 0, 1000, 50), "horizontal", "A");

      panelConstraints.forEach((current) => {
        group.addChild(
          "panel",
          new DOMRect(
            0,
            0,
            typeof current.defaultSize === "number"
              ? current.defaultSize * 10
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
        group,
        panelApis: panelConstraints.map((_, index) =>
          getImperativePanelMethods({
            groupId: group.id,
            panelId: group.panels[index].id
          })
        )
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

    describe("collapse", () => {
      test("does nothing if panel is not collapsible", () => {
        const { panelApis } = init([{}, {}]);
        panelApis[0].collapse();

        expect(onMountedGroupsChange).not.toHaveBeenCalled();
      });

      test("does nothing if panel is already collapsed", () => {
        const { panelApis } = init([
          {
            defaultSize: 0,
            collapsible: true
          },
          {}
        ]);
        panelApis[0].collapse();

        expect(onMountedGroupsChange).not.toHaveBeenCalled();
      });

      // TODO
      test.skip("resizes panel to collapsed size", () => {
        const { panelApis } = init([
          {
            defaultSize: 50,
            collapsible: true
          },
          {}
        ]);
        panelApis[0].collapse();

        expect(onMountedGroupsChange).toHaveBeenCalledTimes(1);
        expect(onMountedGroupsChange).toHaveBeenCalledWith([0, 100]);
      });
    });

    describe("expand", () => {
      test("does nothing if panel is not collapsible", () => {
        const { panelApis } = init([{ defaultSize: 0 }, {}]);
        panelApis[0].expand();

        expect(onMountedGroupsChange).not.toHaveBeenCalled();
      });

      test("does nothing if panel is not collapsed", () => {
        const { panelApis } = init([
          { collapsible: true, defaultSize: 50 },
          {}
        ]);
        panelApis[0].expand();

        expect(onMountedGroupsChange).not.toHaveBeenCalled();
      });

      // TODO
      test.skip("resizes panel to min size", () => {
        const { panelApis } = init([
          { collapsible: true, defaultSize: 0, minSize: 25 },
          {}
        ]);
        panelApis[0].expand();

        expect(onMountedGroupsChange).toHaveBeenCalledTimes(1);
        expect(onMountedGroupsChange).toHaveBeenCalledWith([25, 100]);
      });
    });

    describe("getSize", () => {
      test("returns the current panel size", () => {
        const { panelApis } = init([{ defaultSize: 25 }, { defaultSize: 75 }]);

        expect(panelApis[0].getSize()).toMatchInlineSnapshot(`
          {
            "asPercentage": 25,
            "inPixels": 250,
          }
        `);
        expect(panelApis[1].getSize()).toMatchInlineSnapshot(`
          {
            "asPercentage": 75,
            "inPixels": 750,
          }
        `);
      });
    });

    describe("isCollapsed", () => {
      test("returns true if collapsible and collapsed", () => {
        const { panelApis } = init([
          { collapsible: true, collapsedSize: 10, defaultSize: 10 },
          {}
        ]);

        expect(panelApis[0].isCollapsed()).toBe(true);
      });

      test("returns false if collapsible and expanded", () => {
        const { panelApis } = init([
          { collapsible: true, collapsedSize: 10, defaultSize: 25 },
          {}
        ]);

        expect(panelApis[0].isCollapsed()).toBe(false);
      });

      test("returns false if not collapsible", () => {
        const { panelApis } = init([{ defaultSize: 0 }, {}]);

        expect(panelApis[0].isCollapsed()).toBe(false);
      });
    });

    describe("resize", () => {
      test("ignores a no-op size update", () => {
        const { panelApis } = init([{ defaultSize: 10 }, {}]);
        panelApis[0].resize(10);

        expect(onMountedGroupsChange).not.toHaveBeenCalled();
      });

      test("ignores an invalid size update", () => {
        const { panelApis } = init([{ defaultSize: 10, minSize: 10 }, {}]);
        panelApis[0].resize(0);

        expect(onMountedGroupsChange).not.toHaveBeenCalled();
      });

      // TODO
      test.skip("validates and updates the panel size", () => {
        const { panelApis } = init([{ defaultSize: 25, minSize: 10 }, {}]);
        panelApis[0].resize(0);

        expect(onMountedGroupsChange).toHaveBeenCalledTimes(1);
        expect(onMountedGroupsChange).toHaveBeenCalledWith([10, 90]);
      });
    });
  });
});

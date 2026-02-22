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
  PanelConstraints,
  PanelImperativeHandle
} from "../../components/panel/types";
import { mountGroup } from "../mountGroup";
import { subscribeToMountedGroup } from "../mutable-state/groups";
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

    const group = mockGroup(new DOMRect(), {
      id: "group",
      orientation: "horizontal"
    });

    const api = getImperativePanelMethods({
      groupId: "group",
      panelId: "B"
    });

    expect(() => (key === "resize" ? api[key](1) : api[key]())).toThrow(
      "Group group not found"
    );

    const unmountGroup = mountGroup(group);

    expect(() => (key === "resize" ? api[key](1) : api[key]())).toThrow(
      /not found for Panel B/
    );

    unmountGroup();
  });

  describe("mounted", () => {
    let onLayoutChange: Mock;
    let removeChangeListener: (() => void) | undefined = undefined;
    let unmountGroup: (() => void) | undefined = undefined;

    function init(panelConstraints: Partial<PanelConstraints>[]) {
      const bounds = new DOMRect(0, 0, 1000, 50);
      const group = mockGroup(bounds, {
        id: "group",
        orientation: "horizontal"
      });

      panelConstraints.forEach(
        ({
          collapsedSize,
          collapsible,
          defaultSize,
          disabled,
          maxSize,
          minSize
        }) => {
          group.addPanel(
            new DOMRect(
              0,
              0,
              defaultSize !== undefined
                ? defaultSize * 10
                : 1000 / panelConstraints.length,
              50
            ),
            undefined,
            {
              collapsedSize:
                collapsedSize !== undefined ? `${collapsedSize}%` : 0,
              collapsible,
              defaultSize:
                defaultSize !== undefined ? `${defaultSize}%` : undefined,
              disabled,
              maxSize: maxSize !== undefined ? `${maxSize}%` : undefined,
              minSize: minSize !== undefined ? `${minSize}%` : 0
            }
          );
        }
      );

      unmountGroup = mountGroup(group);

      removeChangeListener = subscribeToMountedGroup("group", ({ next }) => {
        onLayoutChange(Object.values(next.layout));
      });

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
      onLayoutChange = vi.fn();
    });

    afterEach(() => {
      if (removeChangeListener) {
        removeChangeListener();
      }

      if (unmountGroup) {
        unmountGroup();
      }
    });

    describe("collapse", () => {
      test("does nothing if panel is not collapsible", () => {
        const { panelApis } = init([{}, {}]);
        panelApis[0].collapse();

        expect(onLayoutChange).not.toHaveBeenCalled();
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

        expect(onLayoutChange).not.toHaveBeenCalled();
      });

      test("resizes panel to collapsed size", () => {
        const { panelApis } = init([
          {
            defaultSize: 50,
            collapsible: true
          },
          {}
        ]);
        panelApis[0].collapse();

        expect(onLayoutChange).toHaveBeenCalledTimes(1);
        expect(onLayoutChange).toHaveBeenCalledWith([0, 100]);
      });

      test("allows disabled panel to be collapsed", () => {
        const { panelApis } = init([
          {
            collapsible: true,
            defaultSize: 50,
            disabled: true
          },
          {}
        ]);
        panelApis[0].collapse();

        expect(onLayoutChange).toHaveBeenCalledTimes(1);
        expect(onLayoutChange).toHaveBeenCalledWith([0, 100]);
      });
    });

    describe("expand", () => {
      test("does nothing if panel is not collapsible", () => {
        const { panelApis } = init([{ defaultSize: 0 }, {}]);
        panelApis[0].expand();

        expect(onLayoutChange).not.toHaveBeenCalled();
      });

      test("does nothing if panel is not collapsed", () => {
        const { panelApis } = init([
          { collapsible: true, defaultSize: 50 },
          {}
        ]);
        panelApis[0].expand();

        expect(onLayoutChange).not.toHaveBeenCalled();
      });

      test("expands the panel to the previous pre-collapse size", () => {
        const { panelApis } = init([
          { collapsible: true, defaultSize: 50, minSize: 25 },
          {}
        ]);

        panelApis[0].resize("35");
        expect(onLayoutChange).toHaveBeenCalledTimes(1);
        expect(onLayoutChange).toHaveBeenLastCalledWith([35, 65]);

        panelApis[0].collapse();
        expect(onLayoutChange).toHaveBeenCalledTimes(2);
        expect(onLayoutChange).toHaveBeenLastCalledWith([0, 100]);

        panelApis[0].expand();
        expect(onLayoutChange).toHaveBeenCalledTimes(3);
        expect(onLayoutChange).toHaveBeenLastCalledWith([35, 65]);
      });

      test("expands panel to the minimum size as a fallback", () => {
        const { panelApis } = init([
          { collapsible: true, defaultSize: 0, minSize: 25 },
          {}
        ]);
        panelApis[0].expand();

        expect(onLayoutChange).toHaveBeenCalledTimes(1);
        expect(onLayoutChange).toHaveBeenCalledWith([25, 75]);
      });

      // See github.com/bvaughn/react-resizable-panels/issues/561
      test("edge case: expands panel to a non-zero size if minSize is 0", () => {
        const { panelApis } = init([
          { collapsible: true, defaultSize: 0, minSize: 0 },
          {}
        ]);
        panelApis[0].expand();

        expect(onLayoutChange).toHaveBeenCalledTimes(1);
        expect(onLayoutChange).toHaveBeenCalledWith([1, 99]);
      });

      test("allows disabled panel to be expanded", () => {
        const { panelApis } = init([
          { defaultSize: 0, collapsible: true, disabled: true, minSize: 10 },
          {}
        ]);

        panelApis[0].expand();
        expect(onLayoutChange).toHaveBeenCalledTimes(1);
        expect(onLayoutChange).toHaveBeenCalledWith([10, 90]);
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

        expect(onLayoutChange).not.toHaveBeenCalled();
      });

      test("ignores an invalid size update", () => {
        const { panelApis } = init([{ defaultSize: 10, minSize: 10 }, {}]);
        panelApis[0].resize(0);

        expect(onLayoutChange).not.toHaveBeenCalled();
      });

      test("validates and updates the panel size", () => {
        const { panelApis } = init([{ defaultSize: 25, minSize: 10 }, {}]);
        panelApis[0].resize(0);

        expect(onLayoutChange).toHaveBeenCalledTimes(1);
        expect(onLayoutChange).toHaveBeenCalledWith([10, 90]);
      });

      test("allows disabled panel to be resized", () => {
        const { panelApis } = init([
          { defaultSize: 25, disabled: true, minSize: 10 },
          {}
        ]);

        panelApis[0].resize(0);

        expect(onLayoutChange).toHaveBeenCalledTimes(1);
        expect(onLayoutChange).toHaveBeenCalledWith([10, 90]);
      });
    });
  });
});

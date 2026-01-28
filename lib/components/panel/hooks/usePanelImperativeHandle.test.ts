import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test } from "vitest";
import type { MutablePanel } from "../../../state/MutablePanel";
import { initMutableGroup } from "../../../state/tests/initMutableGroup";
import type { MutableGroupForTest } from "../../../state/tests/MutableGroupForTest";
import { usePanelImperativeHandle } from "./usePanelImperativeHandle";

describe("usePanelImperativeHandle", () => {
  describe("collapse", () => {
    let group: MutableGroupForTest;
    let collapsiblePanel: MutablePanel;
    let nonCollapsiblePanel: MutablePanel;

    beforeEach(() => {
      group = initMutableGroup({
        panels: [
          { collapsedSize: "5%", collapsible: true, id: "collapsible" },
          { id: "not" }
        ]
      });
      collapsiblePanel = group.panels[0];
      nonCollapsiblePanel = group.panels[1];
    });

    test("does nothing if panel is not collapsible", () => {
      const { result } = renderHook(() =>
        usePanelImperativeHandle(nonCollapsiblePanel)
      );
      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 50,
          "not": 50,
        }
      `);

      result.current.collapse();

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 50,
          "not": 50,
        }
      `);
    });

    test("does nothing if panel is already collapsed", () => {
      group.updateLayoutForTest({
        collapsible: 5,
        not: 95
      });

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 5,
          "not": 95,
        }
      `);

      const { result } = renderHook(() =>
        usePanelImperativeHandle(collapsiblePanel)
      );
      result.current.collapse();

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 5,
          "not": 95,
        }
      `);
    });

    test("resizes panel to collapsed size", () => {
      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 50,
          "not": 50,
        }
      `);

      const { result } = renderHook(() =>
        usePanelImperativeHandle(collapsiblePanel)
      );
      result.current.collapse();

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 5,
          "not": 95,
        }
      `);
    });
  });

  describe("expand", () => {
    let group: MutableGroupForTest;
    let collapsiblePanel: MutablePanel;
    let nonCollapsiblePanel: MutablePanel;

    beforeEach(() => {
      group = initMutableGroup({
        panels: [
          {
            collapsedSize: "5%",
            collapsible: true,
            id: "collapsible",
            minSize: "15%"
          },
          { id: "not" }
        ]
      });
      collapsiblePanel = group.panels[0];
      nonCollapsiblePanel = group.panels[1];
    });

    test("does nothing if panel is not collapsible", () => {
      const { result } = renderHook(() =>
        usePanelImperativeHandle(nonCollapsiblePanel)
      );
      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 50,
          "not": 50,
        }
      `);

      result.current.expand();

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 50,
          "not": 50,
        }
      `);
    });

    test("does nothing if panel is not collapsed", () => {
      const { result } = renderHook(() =>
        usePanelImperativeHandle(collapsiblePanel)
      );
      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 50,
          "not": 50,
        }
      `);

      result.current.expand();

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 50,
          "not": 50,
        }
      `);
    });

    test("expands the panel to the previous pre-collapse size", () => {
      const { result } = renderHook(() =>
        usePanelImperativeHandle(collapsiblePanel)
      );

      group.updateLayoutForTest({
        collapsible: 35,
        not: 65
      });

      result.current.collapse();

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 5,
          "not": 95,
        }
      `);

      result.current.expand();

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 35,
          "not": 65,
        }
      `);
    });

    test("expands panel to the minimum size as a fallback", () => {
      const { result } = renderHook(() =>
        usePanelImperativeHandle(collapsiblePanel)
      );

      group.updateLayoutForTest({
        collapsible: 5,
        not: 95
      });

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 5,
          "not": 95,
        }
      `);

      result.current.expand();

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 15,
          "not": 85,
        }
      `);
    });

    // See github.com/bvaughn/react-resizable-panels/issues/561
    test("edge case: expands panel to a non-zero size if minSize is 0", () => {
      const { result } = renderHook(() =>
        usePanelImperativeHandle(collapsiblePanel)
      );

      collapsiblePanel.updateConstraints({
        collapsedSize: "0%",
        collapsible: true,
        maxSize: undefined,
        minSize: "0%"
      });

      group.updateLayoutForTest({
        collapsible: 0,
        not: 100
      });

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 0,
          "not": 100,
        }
      `);

      result.current.expand();

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "collapsible": 1,
          "not": 99,
        }
      `);
    });
  });

  describe("getSize", () => {
    test("returns the current panel size", () => {
      const group = initMutableGroup({
        panels: [
          {
            defaultSize: "35%"
          },
          {}
        ]
      });

      const panel = group.panels[0];

      const { result } = renderHook(() => usePanelImperativeHandle(panel));

      expect(result.current.getSize()).toMatchInlineSnapshot(`
        {
          "asPercentage": 35,
          "inPixels": 10,
        }
      `);
    });
  });

  describe("isCollapsed", () => {
    let group: MutableGroupForTest;
    let collapsiblePanel: MutablePanel;
    let nonCollapsiblePanel: MutablePanel;

    beforeEach(() => {
      group = initMutableGroup({
        panels: [
          {
            collapsedSize: "5%",
            collapsible: true,
            id: "collapsible",
            minSize: "15%"
          },
          { id: "not" }
        ]
      });
      collapsiblePanel = group.panels[0];
      nonCollapsiblePanel = group.panels[1];
    });

    test("returns true if collapsible and collapsed", () => {
      group.updateLayoutForTest({
        collapsible: 5,
        not: 95
      });

      const { result } = renderHook(() =>
        usePanelImperativeHandle(collapsiblePanel)
      );

      expect(result.current.isCollapsed()).toBe(true);
    });

    test("returns false if collapsible and expanded", () => {
      const { result } = renderHook(() =>
        usePanelImperativeHandle(collapsiblePanel)
      );

      expect(result.current.isCollapsed()).toBe(false);
    });

    test("returns false if not collapsible", () => {
      group.updateLayoutForTest({
        collapsible: 100,
        not: 0
      });

      const { result } = renderHook(() =>
        usePanelImperativeHandle(nonCollapsiblePanel)
      );

      expect(result.current.isCollapsed()).toBe(false);
    });
  });

  describe("resize", () => {
    let group: MutableGroupForTest;
    let leftPanel: MutablePanel;

    beforeEach(() => {
      group = initMutableGroup({
        panels: [
          {
            defaultSize: "15%",
            id: "left",
            minSize: "15%"
          },
          { id: "right" }
        ]
      });
      leftPanel = group.panels[0];
    });

    test("ignores a no-op size update", () => {
      const { result } = renderHook(() => usePanelImperativeHandle(leftPanel));

      expect(() => result.current.resize("15%")).toDispatchEvents(group, {
        layoutChange: 0,
        layoutChanged: 0
      });

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "left": 15,
          "right": 85,
        }
      `);
    });

    test("ignores an invalid size update", () => {
      const { result } = renderHook(() => usePanelImperativeHandle(leftPanel));

      expect(() => result.current.resize("10%")).toDispatchEvents(group, {
        layoutChange: 0,
        layoutChanged: 0
      });

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "left": 15,
          "right": 85,
        }
      `);
    });

    test("validates and updates the panel size", () => {
      const { result } = renderHook(() => usePanelImperativeHandle(leftPanel));

      expect(() => result.current.resize("25%")).toDispatchEvents(group, {
        layoutChange: 1,
        layoutChanged: 1
      });

      expect(group.layout).toMatchInlineSnapshot(`
        {
          "left": 25,
          "right": 75,
        }
      `);
    });
  });
});

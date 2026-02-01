import { describe, expect, test } from "vitest";
import { MutableGroupForTest } from "./tests/MutableGroupForTest";
import { MutablePanelForTest } from "./tests/MutablePanelForTest";

// TODO [mutable] Test .offset and .size

describe("MutablePanel", () => {
  describe("events", () => {
    test('dispatches "constraintsChange" event when Panel constraints are updated', () => {
      {
        const group = new MutableGroupForTest();
        const panel = new MutablePanelForTest({
          group
        });

        expect(() => {
          panel.updateConstraints({
            collapsedSize: 1,
            collapsible: true,
            maxSize: "0%",
            minSize: "100%"
          });
        }).toDispatchEvents(panel, { constraintsChange: 1 });
      }

      {
        const group = new MutableGroupForTest();
        const panel = new MutablePanelForTest({
          group
        });

        expect(() => {
          panel.updateConstraints({
            collapsedSize: "0%",
            collapsible: false,
            maxSize: "0%",
            minSize: "100%"
          });
        }).toDispatchEvents(panel, { constraintsChange: 1 });
      }

      {
        const group = new MutableGroupForTest();
        const panel = new MutablePanelForTest({
          group
        });

        expect(() => {
          panel.updateConstraints({
            collapsedSize: "0%",
            collapsible: true,
            maxSize: 1,
            minSize: "100%"
          });
        }).toDispatchEvents(panel, { constraintsChange: 1 });
      }

      {
        const group = new MutableGroupForTest();
        const panel = new MutablePanelForTest({
          group
        });

        expect(() => {
          panel.updateConstraints({
            collapsedSize: "0%",
            collapsible: true,
            maxSize: "0%",
            minSize: "99%"
          });
        }).toDispatchEvents(panel, { constraintsChange: 1 });
      }
    });

    test('does not dispatch "constraintsChange" event when constraints are updated to the same value', () => {
      const group = new MutableGroupForTest();
      const panel = new MutablePanelForTest({
        group
      });

      expect(() => {
        panel.updateConstraints({
          collapsedSize: "0%",
          collapsible: false,
          maxSize: "100%",
          minSize: "0%"
        });
      }).toDispatchEvents(panel, { constraintsChange: 0 });
    });

    test('dispatches "styleChange" event when Panel style changes', () => {
      const group = new MutableGroupForTest();
      group.mockGroupHTMLElementInterface.resizeForTest({
        width: 100,
        height: 50
      });

      const panelLeft = new MutablePanelForTest({
        group,
        id: "left"
      });
      const panelRight = new MutablePanelForTest({
        group,
        id: "right"
      });

      expect(() => {
        panelLeft.mount();
        panelRight.mount();
        group.mount();
      }).toDispatchEvents(panelLeft, {
        styleChange: 0
      });

      expect(() => {
        group.updateLayoutForTest({ left: 25, right: 75 });
      }).toDispatchEvents(panelLeft, {
        styleChange: 1
      });

      expect(() => {
        group.updateLayoutForTest({ left: 25, right: 75 });
      }).toDispatchEvents(panelLeft, {
        styleChange: 0
      });
    });
  });

  test("registers and un-registers with parent Group", () => {
    const group = new MutableGroupForTest();
    expect(group.separators).toHaveLength(0);

    const panel = new MutablePanelForTest({
      group
    });
    expect(group.panels).toHaveLength(0);
    panel.mount();
    expect(group.panels).toHaveLength(1);

    expect(group).toMatchInlineSnapshot(`
      Group: group
        Panel: panel
          - Range 0% - 100%
          - Flex: 1%
        Layout:
    `);

    // No-op to verify Separator isn't registered twice
    panel.mount();
    group.addPanels(panel);
    expect(group.panels).toHaveLength(1);

    expect(group).toMatchInlineSnapshot(`
      Group: group
        Panel: panel
          - Range 0% - 100%
          - Flex: 1%
        Layout:
    `);

    panel.unmount();
    expect(group.panels).toHaveLength(0);

    expect(group).toMatchInlineSnapshot(`
        Group: group
          Layout:
      `);

    panel.unmount();
    group.removePanels(panel);
    expect(group.panels).toHaveLength(0);
  });
});

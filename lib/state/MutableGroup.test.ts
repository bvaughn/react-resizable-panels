import { describe, expect, test } from "vitest";
import type { GroupLayoutTransaction } from "./GroupLayoutTransaction";
import { MutablePanel } from "./MutablePanel";
import { MutableSeparator } from "./MutableSeparator";
import { initMutableGroup } from "./tests/initMutableGroup";
import { MutableGroupForTest } from "./tests/MutableGroupForTest";
import { MutablePanelForTest } from "./tests/MutablePanelForTest";
import { MutableSeparatorForTest } from "./tests/MutableSeparatorForTest";

describe("MutableGroup", () => {
  describe("events", () => {
    test('dispatches "childrenChange" event when Panels are added or removed', () => {
      const group = new MutableGroupForTest();

      let panelOne: MutablePanel;
      let panelTwo: MutablePanel;

      expect(() => {
        panelOne = new MutablePanelForTest({
          group,
          id: "one"
        });
        panelTwo = new MutablePanelForTest({
          group,
          id: "two"
        });
      }).toDispatchEvents(group, { childrenChange: 0 });

      expect(() => {
        panelOne.mount();
        panelTwo.mount();
      }).toDispatchEvents(group, { childrenChange: 2 });

      // No event if nothing changed
      expect(() => {
        group.addPanels(panelOne, panelTwo);
      }).toDispatchEvents(group, { childrenChange: 0 });

      expect(() => {
        group.removePanels(panelOne, panelTwo);
      }).toDispatchEvents(group, { childrenChange: 1 });

      // No event if nothing changed
      expect(() => {
        group.removePanels(panelOne, panelTwo);
      }).toDispatchEvents(group, { childrenChange: 0 });
    });

    test('dispatches "childrenChange" event when Separators are added or removed', () => {
      const group = new MutableGroupForTest();

      let separatorOne: MutableSeparator;
      let separatorTwo: MutableSeparator;

      expect(() => {
        separatorOne = new MutableSeparatorForTest({ group, id: "one" });
        separatorTwo = new MutableSeparatorForTest({ group, id: "two" });
      }).toDispatchEvents(group, { childrenChange: 0 });

      expect(() => {
        separatorOne.mount();
        separatorTwo.mount();
      }).toDispatchEvents(group, { childrenChange: 2 });

      // No event if nothing changed
      expect(() => {
        group.addSeparators(separatorOne, separatorTwo);
      }).toDispatchEvents(group, { childrenChange: 0 });

      expect(() => {
        group.removeSeparators(separatorOne, separatorTwo);
      }).toDispatchEvents(group, { childrenChange: 1 });

      // No event if nothing changed
      expect(() => {
        group.removeSeparators(separatorOne, separatorTwo);
      }).toDispatchEvents(group, { childrenChange: 0 });
    });

    test('dispatches "groupSizeChange" event when Group dimensions are updated', () => {
      const group = new MutableGroupForTest();

      expect(() => {
        group.mockGroupHTMLElementInterface.resizeForTest({
          height: 100,
          width: 100
        });
      }).toDispatchEvents(group, { groupSizeChange: 1 });
    });

    test('does not dispatch "groupSizeChange" event when Group dimensions are updated to the same value', () => {
      const group = new MutableGroupForTest();

      expect(() => {
        group.mockGroupHTMLElementInterface.resizeForTest({
          height: 500,
          width: 1000
        });
      }).toDispatchEvents(group, { groupSizeChange: 0 });
    });

    test('does not dispatch "groupSizeChange" event when non-dominant Group dimensions are updated', () => {
      const group = new MutableGroupForTest();

      expect(() => {
        group.mockGroupHTMLElementInterface.resizeForTest({
          height: 1500,
          width: 1000
        });
      }).toDispatchEvents(group, { groupSizeChange: 0 });
    });

    test('dispatches "layoutChange" and "layoutChanged" for the initial layout', () => {
      const group = new MutableGroupForTest();
      const panelLeft = new MutablePanelForTest({
        group,
        id: "left"
      });
      const panelRight = new MutablePanelForTest({
        group,
        id: "right"
      });
      group.addPanels(panelLeft, panelRight);

      expect(() => {
        group.mockGroupHTMLElementInterface.resizeForTest({
          width: 100,
          height: 50
        });
        group.flushPendingValidation();
      }).toDispatchEvents(group, {
        layoutChange: 1,
        layoutChanged: 1
      });
    });

    test('dispatches "layoutChange" -> "layoutChanged" event sequence', () => {
      const group = new MutableGroupForTest();
      const panelLeft = new MutablePanelForTest({
        group,
        id: "left"
      });
      const panelRight = new MutablePanelForTest({
        group,
        id: "right"
      });
      group.addPanels(panelLeft, panelRight);
      group.mockGroupHTMLElementInterface.resizeForTest({
        width: 100,
        height: 50
      });

      let transaction: GroupLayoutTransaction | null = null;

      expect(() => {
        transaction = group.startLayoutTransaction();
      }).toDispatchEvents(group, {
        layoutChange: 0,
        layoutChanged: 0
      });

      expect(() => {
        transaction!.proposedUpdate({
          left: 25,
          right: 75
        });
      }).toDispatchEvents(group, {
        layoutChange: 1,
        layoutChanged: 0
      });

      // No change
      expect(() => {
        transaction!.proposedUpdate({
          left: 25,
          right: 75
        });
      }).toDispatchEvents(group, {
        layoutChange: 0,
        layoutChanged: 0
      });

      expect(() => {
        transaction!.endTransaction();
      }).toDispatchEvents(group, {
        layoutChange: 0,
        layoutChanged: 1
      });
    });

    test('does not dispatch "layoutChanged" event sequence if the transaction ends back at the initial state', () => {
      const group = new MutableGroupForTest();
      const panelLeft = new MutablePanelForTest({
        defaultSize: "50%",
        group,
        id: "left"
      });
      const panelRight = new MutablePanelForTest({
        defaultSize: "50%",
        group,
        id: "right"
      });
      group.mockGroupHTMLElementInterface.resizeForTest({
        width: 100,
        height: 50
      });
      group.addPanels(panelLeft, panelRight);
      group.flushPendingValidation();

      expect(() => {
        group
          .startLayoutTransaction()
          .proposedUpdate({ left: 25, right: 75 })
          .proposedUpdate({ left: 50, right: 50 })
          .endTransaction();
      }).toDispatchEvents(group, {
        layoutChange: 2,
        layoutChanged: 0
      });
    });

    test('dispatches "separatorStatesChange" event when Separators are updated in response to user input', () => {
      const group = new MutableGroupForTest();
      const separatorOne = new MutableSeparatorForTest({ group, id: "one" });
      const separatorTwo = new MutableSeparatorForTest({ group, id: "two" });

      expect(() => {
        group.addSeparators(separatorOne, separatorTwo);
      }).toDispatchEvents(group, { separatorStatesChange: 0 });

      expect(() => {
        group.updateSeparatorState(separatorOne, "default");
        group.updateSeparatorState(separatorTwo, "default");
      }).toDispatchEvents(group, { separatorStatesChange: 0 });

      expect(() => {
        group.updateSeparatorState(separatorOne, "hover");
      }).toDispatchEvents(group, { separatorStatesChange: 1 });

      expect(() => {
        group.updateSeparatorState(separatorOne, "hover");
      }).toDispatchEvents(group, { separatorStatesChange: 0 });

      expect(() => {
        group.updateSeparatorState(separatorOne, "default");
      }).toDispatchEvents(group, { separatorStatesChange: 1 });

      expect(() => {
        group.removeSeparators(separatorOne, separatorTwo);
      }).toDispatchEvents(group, { separatorStatesChange: 0 });
    });
  });

  describe("updateDimensions", () => {
    test("changes to size should schedule the current layout for (re)validation", () => {
      const group = initMutableGroup({
        groupDimensions: { width: 100, height: 50 },
        panels: [{ id: "left", defaultSize: 35, minSize: 35 }, { id: "right" }]
      });

      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Default size 35px
            - Range 35px - 100%
            - Flex: 35%
          Panel: right
            - Range 0% - 100%
            - Flex: 65%
          Layout:
            - left: 35
            - right: 65
      `);

      const panel = group.panels[0];
      expect(panel.id).toBe("left");

      expect(() => {
        group.mockGroupHTMLElementInterface.resizeForTest({
          width: 50,
          height: 50
        });
        group.flushPendingValidation();
      }).toDispatchEvents(panel, {
        styleChange: 1
      });

      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Default size 35px
            - Range 35px - 100%
            - Flex: 70%
          Panel: right
            - Range 0% - 100%
            - Flex: 30%
          Layout:
            - left: 70
            - right: 30
      `);
    });
  });

  describe("panel constraints", () => {
    test("changes to panel constraints should schedule the current layout for (re)validation", () => {
      const group = initMutableGroup({
        panels: [{ id: "left" }, { id: "right" }]
      });
      const panel = group.panels[0];
      expect(panel.id).toBe("left");
      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 0% - 100%
            - Flex: 50%
          Panel: right
            - Range 0% - 100%
            - Flex: 50%
          Layout:
            - left: 50
            - right: 50
      `);

      expect(() => {
        group.panels[0].updateConstraints({
          collapsedSize: "0%",
          collapsible: false,
          maxSize: "100%",
          minSize: "65%"
        });
      }).toDispatchEvents(panel, { styleChange: 0 });
      expect(() => {
        group.flushPendingValidation();
      }).toDispatchEvents(panel, { styleChange: 1 });
      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 65% - 100%
            - Flex: 65%
          Panel: right
            - Range 0% - 100%
            - Flex: 35%
          Layout:
            - left: 65
            - right: 35
      `);
    });
  });

  describe("transactions", () => {
    test("should validate and update proposed layout and derived ARIA attributes", () => {
      const group = initMutableGroup({
        panels: [
          { id: "left", minSize: "25%" },
          { id: "right", minSize: "25%" }
        ]
      });
      const panel = group.panels[0];
      expect(panel.id).toBe("left");
      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 25% - 100%
            - Flex: 50%
          Panel: right
            - Range 25% - 100%
            - Flex: 50%
          Layout:
            - left: 50
            - right: 50
      `);

      // Invalid (account to constraints)
      expect(() => {
        group.updateLayoutForTest({
          left: 25,
          right: 75
        });
      }).toDispatchEvents(panel, { styleChange: 1 });
      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 25% - 100%
            - Flex: 25%
          Panel: right
            - Range 25% - 100%
            - Flex: 75%
          Layout:
            - left: 25
            - right: 75
      `);
    });

    test("should ignore invalid proposed layouts", () => {
      const group = initMutableGroup({
        defaultLayout: { left: 25, right: 75 },
        panels: [
          { id: "left", minSize: "25%" },
          { id: "right", minSize: "25%" }
        ]
      });
      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 25% - 100%
            - Flex: 25%
          Panel: right
            - Range 25% - 100%
            - Flex: 75%
          Layout:
            - left: 25
            - right: 75
      `);

      // Invalid (account to constraints)
      group.updateLayoutForTest({
        left: 0,
        right: 100
      });
      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 25% - 100%
            - Flex: 25%
          Panel: right
            - Range 25% - 100%
            - Flex: 75%
          Layout:
            - left: 25
            - right: 75
      `);
    });

    // See github.com/bvaughn/react-resizable-panels/issues/576
    test("should not throw if the wrong number of panels are provided", () => {
      const group = initMutableGroup({
        defaultLayout: { left: 25, right: 75 },
        panels: [
          { id: "left", minSize: "25%" },
          { id: "right", minSize: "25%" }
        ]
      });
      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 25% - 100%
            - Flex: 25%
          Panel: right
            - Range 25% - 100%
            - Flex: 75%
          Layout:
            - left: 25
            - right: 75
      `);

      // Wrong number of panels
      group.updateLayoutForTest({
        left: 25,
        center: 50,
        right: 25
      });

      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 25% - 100%
            - Flex: 25%
          Panel: right
            - Range 25% - 100%
            - Flex: 75%
          Layout:
            - left: 25
            - right: 75
      `);
    });

    test("should ignore mismatching layout/panel ids ", () => {
      const group = initMutableGroup({
        defaultLayout: { left: 25, right: 75 },
        panels: [
          { id: "left", minSize: "25%" },
          { id: "right", minSize: "25%" }
        ]
      });
      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 25% - 100%
            - Flex: 25%
          Panel: right
            - Range 25% - 100%
            - Flex: 75%
          Layout:
            - left: 25
            - right: 75
      `);

      // Wrong panel ids
      group.updateLayoutForTest({
        top: 35,
        bottom: 65
      });

      expect(group).toMatchInlineSnapshot(`
        Group: a
          Panel: left
            - Range 25% - 100%
            - Flex: 25%
          Panel: right
            - Range 25% - 100%
            - Flex: 75%
          Layout:
            - left: 25
            - right: 75
      `);
    });

    test("should throw if multiple transactions are started concurrently", () => {
      const group = new MutableGroupForTest();
      group.startLayoutTransaction();
      expect(() => {
        group.startLayoutTransaction();
      }).toThrow();
    });

    test("should throw if ended more than once", () => {
      const group = new MutableGroupForTest();
      const transaction = group.startLayoutTransaction();
      transaction.endTransaction();
      expect(() => {
        transaction.endTransaction();
      }).toThrow();
    });

    test("should throw if updated after end", () => {
      const group = new MutableGroupForTest();
      const transaction = group.startLayoutTransaction();
      transaction.endTransaction();
      expect(() => {
        transaction.proposedUpdate({});
      }).toThrow();
    });
  });

  describe("invariants", () => {
    test("throws for duplicate Panel ids", () => {
      const group = new MutableGroupForTest();
      group.addPanels(
        new MutablePanelForTest({
          group,
          id: "foo"
        })
      );
      expect(() =>
        group.addPanels(
          new MutablePanelForTest({
            group,
            id: "foo"
          })
        )
      ).toThrow('Panel ids must be unique; id "foo" was used more than once');

      expect(() =>
        group.addPanels(
          new MutablePanelForTest({
            group,
            id: "bar"
          }),
          new MutablePanelForTest({
            group,
            id: "bar"
          })
        )
      ).toThrow('Panel ids must be unique; id "bar" was used more than once');
    });

    test("throws for duplicate Separator ids", () => {
      const group = new MutableGroupForTest();
      group.addSeparators(
        new MutableSeparatorForTest({
          group,
          id: "foo"
        })
      );
      expect(() =>
        group.addSeparators(
          new MutableSeparatorForTest({
            group,
            id: "foo"
          })
        )
      ).toThrow(
        'Separator ids must be unique; id "foo" was used more than once'
      );

      expect(() =>
        group.addSeparators(
          new MutableSeparatorForTest({
            group,
            id: "bar"
          }),
          new MutableSeparatorForTest({
            group,
            id: "bar"
          })
        )
      ).toThrow(
        'Separator ids must be unique; id "bar" was used more than once'
      );
    });
  });
});

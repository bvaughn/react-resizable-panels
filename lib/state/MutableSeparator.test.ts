import { describe, expect, test } from "vitest";
import { initMutableGroup } from "./tests/initMutableGroup";
import { MutableGroupForTest } from "./tests/MutableGroupForTest";
import { MutableSeparatorForTest } from "./tests/MutableSeparatorForTest";

// TODO [mutable] Test .offset and .size

describe("MutableSeparator", () => {
  describe("events", () => {
    test('dispatches "ariaAttributes" event when ARIA attributes change', () => {
      const group = initMutableGroup({
        panels: [
          { id: "left", defaultSize: "25%" },
          { id: "center", defaultSize: "25%" },
          { id: "right", defaultSize: "50%" }
        ],
        separators: ["separator"]
      });
      const separator = group.separators[0];

      expect(separator).toMatchInlineSnapshot(`
        Separator: separator
          - State: default
          - ARIA: {"ariaControls":"left","ariaValueMax":100,"ariaValueMin":0,"ariaValueNow":25}
      `);

      expect(() => {
        group
          .startLayoutTransaction()
          .proposedUpdate({
            left: 35,
            center: 15,
            right: 50
          })
          .endTransaction();
      }).toDispatchEvents(separator, {
        ariaAttributes: 1
      });

      expect(separator).toMatchInlineSnapshot(`
        Separator: separator
          - State: default
          - ARIA: {"ariaControls":"left","ariaValueMax":100,"ariaValueMin":0,"ariaValueNow":35}
      `);

      expect(() => {
        group
          .startLayoutTransaction()
          .proposedUpdate({
            left: 35,
            center: 35,
            right: 30
          })
          .endTransaction();
      }).toDispatchEvents(separator, {
        ariaAttributes: 0
      });

      expect(separator).toMatchInlineSnapshot(`
        Separator: separator
          - State: default
          - ARIA: {"ariaControls":"left","ariaValueMax":100,"ariaValueMin":0,"ariaValueNow":35}
      `);
    });

    test('dispatches "separatorState" event when Separator state changes', () => {
      const group = initMutableGroup({
        separators: ["one", "two"]
      });
      const one = group.separators.find((current) => current.id === "one")!;
      const two = group.separators.find((current) => current.id === "two")!;

      expect(() => {
        group.updateSeparatorState(one, "hover");
      }).toDispatchEvents(one, {
        separatorState: 1
      });

      expect(group).toMatchInlineSnapshot(`
        Group: a
          Separator: one
            - State: hover
            - ARIA: undefined
          Separator: two
            - State: default
            - ARIA: undefined
          Layout:
      `);

      expect(() => {
        group.updateSeparatorState(one, "dragging");
      }).toDispatchEvents(two, {
        separatorState: 0
      });

      expect(group).toMatchInlineSnapshot(`
        Group: a
          Separator: one
            - State: dragging
            - ARIA: undefined
          Separator: two
            - State: default
            - ARIA: undefined
          Layout:
      `);

      expect(() => {
        group.updateSeparatorState(one, "default");
      }).toDispatchEvents(one, {
        separatorState: 1
      });

      expect(group).toMatchInlineSnapshot(`
        Group: a
          Separator: one
            - State: default
            - ARIA: undefined
          Separator: two
            - State: default
            - ARIA: undefined
          Layout:
      `);
    });
  });

  test("registers and un-registers with parent Group", () => {
    const group = new MutableGroupForTest();
    expect(group.separators).toHaveLength(0);

    const separator = new MutableSeparatorForTest({ group });
    expect(group.separators).toHaveLength(0);
    separator.mount();
    expect(group.separators).toHaveLength(1);

    expect(group).toMatchInlineSnapshot(`
      Group: group
        Separator: separator
          - State: default
          - ARIA: undefined
        Layout:
    `);

    // No-op to verify Separator isn't registered twice
    separator.mount();
    group.addSeparators(separator);
    expect(group.separators).toHaveLength(1);

    expect(group).toMatchInlineSnapshot(`
      Group: group
        Separator: separator
          - State: default
          - ARIA: undefined
        Layout:
    `);

    separator.unmount();
    expect(group.separators).toHaveLength(0);

    expect(group).toMatchInlineSnapshot(`
      Group: group
        Layout:
    `);

    separator.unmount();
    group.removeSeparators(separator);
    expect(group.separators).toHaveLength(0);
  });
});

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { eventEmitter } from "../../global/mutableState";
import { moveSeparator } from "../../global/test/moveSeparator";
import { assert } from "../../utils/assert";
import {
  setDefaultElementBounds,
  setElementBoundsFunction
} from "../../utils/test/mockBoundingClientRect";
import { Panel } from "../panel/Panel";
import { Separator } from "../separator/Separator";
import { Group } from "./Group";
import { createRef } from "react";
import type { GroupImperativeHandle } from "./types";

describe("Group", () => {
  test("changes to defaultProps or disableCursor should not cause Group to remount", () => {
    const onMountedGroupsChange = vi.fn();
    const removeListener = eventEmitter.addListener(
      "mountedGroupsChange",
      onMountedGroupsChange
    );

    const { rerender } = render(
      <Group
        defaultLayout={{
          a: 50,
          b: 50
        }}
        disableCursor={false}
      >
        <Panel id="a" />
        <Panel id="b" />
      </Group>
    );
    expect(onMountedGroupsChange).toHaveBeenCalled();

    onMountedGroupsChange.mockReset();

    rerender(
      <Group
        defaultLayout={{
          a: 35,
          b: 65
        }}
        disableCursor={true}
      >
        <Panel id="a" />
        <Panel id="b" />
      </Group>
    );
    expect(onMountedGroupsChange).not.toHaveBeenCalled();

    removeListener();
  });

  test("should support updates to either Group or Panel ids", () => {
    const { rerender } = render(
      <Group id="a">
        <Panel id="a-a" />
        <Panel id="a-b" />
      </Group>
    );

    rerender(
      <Group id="a">
        <Panel id="b-a" />
        <Panel id="b-b" />
      </Group>
    );

    rerender(
      <Group id="b">
        <Panel id="b-a" />
        <Panel id="b-b" />
      </Group>
    );

    rerender(
      <Group id="c">
        <Panel id="c-a" />
        <Panel id="c-b" />
      </Group>
    );
  });

  describe("defaultLayout", () => {
    test("should be ignored if it does not match Panel ids", () => {
      const onLayoutChange = vi.fn();

      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

      render(
        <Group
          defaultLayout={{
            foo: 40,
            bar: 60
          }}
          onLayoutChange={onLayoutChange}
        >
          <Panel id="bar" />
          <Panel id="baz" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        bar: 50,
        baz: 50
      });
    });

    test("should be ignored if it does not match Panel ids (mounted within hidden subtree)", () => {
      const onLayoutChange = vi.fn();

      render(
        <Group
          defaultLayout={{
            foo: 40,
            bar: 60
          }}
          onLayoutChange={onLayoutChange}
        >
          <Panel id="bar" />
          <Panel id="baz" />
        </Group>
      );

      expect(onLayoutChange).not.toHaveBeenCalled();

      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        bar: 50,
        baz: 50
      });
    });
  });

  describe("groupRef", () => {
    test("should work with an empty Group", () => {
      const onLayoutChange = vi.fn();
      const groupRef = createRef<GroupImperativeHandle>();

      render(<Group groupRef={groupRef} onLayoutChange={onLayoutChange} />);

      const group = groupRef.current;

      assert(group !== null);
      expect(group.getLayout()).toEqual({});
      expect(onLayoutChange).not.toHaveBeenCalled();

      // This is meaningless but technically valid
      group.setLayout({});

      // This is still invalid
      expect(() =>
        group.setLayout({
          foo: 50,
          bar: 50
        })
      ).toThrow("Invalid 0 panel layout: 50%, 50%");
    });

    test("should work within a hidden subtree", () => {
      // Note this test mimics the hidden subtree scenario by using a groupSize of 0
      setElementBoundsFunction(() => new DOMRect(0, 0, 0, 0));

      const onLayoutChange = vi.fn();
      const groupRef = createRef<GroupImperativeHandle>();

      render(
        <Group groupRef={groupRef} onLayoutChange={onLayoutChange}>
          <Panel defaultSize="35%" id="left" maxSize="45%">
            left
          </Panel>
          <Panel id="right">right</Panel>
        </Group>
      );

      const group = groupRef.current;

      assert(group !== null);
      expect(onLayoutChange).not.toHaveBeenCalled();

      // Size constraints can't really be validated while the Group is hidden
      expect(group.getLayout()).toEqual({});

      // This is essentially a no-op as well
      // Any values set at this point can't be validated and so they'll be overridden when the Group becomes visible
      group.setLayout({
        left: 45,
        right: 55
      });

      // Simulate the Group becoming visible; this should trigger default layout calculation
      setElementBoundsFunction((element) => {
        if (element.hasAttribute("data-panel")) {
          return new DOMRect(0, 0, 50, 50);
        } else {
          return new DOMRect(0, 0, 100, 50);
        }
      });
      expect(group.getLayout()).toEqual({
        left: 35,
        right: 65
      });
      expect(onLayoutChange).toHaveBeenCalledWith({
        left: 35,
        right: 65
      });
    });
  });

  describe("onLayoutChange", () => {
    beforeEach(() => {
      setElementBoundsFunction((element) => {
        if (element.hasAttribute("data-group")) {
          return new DOMRect(0, 0, 100, 50);
        } else if (element.hasAttribute("data-panel")) {
          return new DOMRect(0, 0, 50, 50);
        }
      });
    });

    test("should not be called before layout has been initialized", () => {
      const onLayoutChange = vi.fn();

      const { rerender } = render(
        <Group onLayoutChange={onLayoutChange}>
          <Panel id="a" />
          <Panel id="b" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 50,
        b: 50
      });

      rerender(
        <Group onLayoutChange={onLayoutChange}>
          <Panel id="a" />
          <Panel id="b" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
    });

    test("should be called with default layout", () => {
      const onLayoutChange = vi.fn();

      const { rerender } = render(
        <Group onLayoutChange={onLayoutChange}>
          <Panel id="a" defaultSize={40} />
          <Panel id="b" defaultSize={60} />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 40,
        b: 60
      });

      rerender(
        <Group className="something" onLayoutChange={onLayoutChange}>
          <Panel id="a" defaultSize={40} />
          <Panel id="b" defaultSize={60} />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
    });

    test("should be called when panels change", () => {
      const onLayoutChange = vi.fn();

      const { rerender } = render(
        <Group onLayoutChange={onLayoutChange}>
          <Panel id="a" />
          <Panel id="b" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 50,
        b: 50
      });

      rerender(
        <Group onLayoutChange={onLayoutChange}>
          <Panel id="a" />
          <Panel id="b" />
          <Panel id="c" />
          <Panel id="d" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(2);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 25,
        b: 25,
        c: 25,
        d: 25
      });
    });

    test("should be called once per layout change", async () => {
      const onLayoutChange = vi.fn();

      render(
        <Group onLayoutChange={onLayoutChange}>
          <Panel id="a" defaultSize={50} />
          <Separator id="b" />
          <Panel id="c" defaultSize={50} />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 50,
        c: 50
      });

      onLayoutChange.mockReset();

      // Simulate a drag from the draggable element to the target area
      await moveSeparator(25);

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 75,
        c: 25
      });

      onLayoutChange.mockReset();

      // Move the pointer a bit, but not enough to impact the layout
      await moveSeparator(0.0001);

      expect(onLayoutChange).not.toHaveBeenCalled();
    });
  });

  describe("invariants", () => {
    test("duplicate panel ids", () => {
      // This is allowed
      render(
        <Group>
          <Panel id="foo" />
          <Separator id="foo" />
          <Panel id="bar" />
        </Group>
      );

      // This is not allowed
      expect(() =>
        render(
          <Group>
            <Panel id="foo" />
            <Panel id="foo" />
          </Group>
        )
      ).toThrow('Panel ids must be unique; id "foo" was used more than once');
    });

    test("duplicate separator ids", () => {
      expect(() =>
        render(
          <Group>
            <Panel id="left" />
            <Separator id="foo" />
            <Panel id="center" />
            <Separator id="foo" />
            <Panel id="right" />
          </Group>
        )
      ).toThrow(
        'Separator ids must be unique; id "foo" was used more than once'
      );
    });
  });

  describe("HTML attributes", () => {
    test("should expose explicit id and testid", () => {
      const { container } = render(<Group id="group" />);

      const group = container.querySelector("[data-group]");
      assert(group);

      expect(group.getAttribute("data-testid")).toBe("group");
      expect(group.getAttribute("id")).toBe("group");
    });

    test("should pass through ...rest attributes", () => {
      const { container } = render(<Group data-foo="abc" data-bar="123" />);

      const group = container.querySelector("[data-group]");
      assert(group);

      expect(group.getAttribute("data-foo")).toBe("abc");
      expect(group.getAttribute("data-bar")).toBe("123");
    });

    test("problematic styles should be suppressed", () => {
      const { container } = render(
        <Group
          style={{
            display: "block",
            flexDirection: "column",
            flexWrap: "wrap"
          }}
        />
      );

      const group = container.querySelector("[data-group]") as HTMLElement;

      expect(group.style.display).toBe("flex");
      expect(group.style.flexDirection).toBe("row");
      expect(group.style.flexWrap).toBe("nowrap");
    });
  });
});

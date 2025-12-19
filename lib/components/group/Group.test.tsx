import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { eventEmitter } from "../../global/mutableState";
import { moveSeparator } from "../../global/test/moveSeparator";
import { assert } from "../../utils/assert";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";
import { Panel } from "../panel/Panel";
import { Separator } from "../separator/Separator";
import { Group } from "./Group";

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
    expect(onMountedGroupsChange).toHaveBeenCalledTimes(1);

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
    expect(onMountedGroupsChange).toHaveBeenCalledTimes(1);

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
    test("too many separators", () => {
      expect(() =>
        render(
          <Group>
            <Panel />
            <Separator />
          </Group>
        )
      ).toThrow("Invalid Group configuration; too many Separator components");
    });

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

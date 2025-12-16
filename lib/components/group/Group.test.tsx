import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { moveSeparator } from "../../global/test/moveSeparator";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";
import { Panel } from "../panel/Panel";
import { Separator } from "../separator/Separator";
import { Group } from "./Group";

describe("Group", () => {
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

  describe("id/data-testid", () => {
    test("should expose explicit id and testid", () => {
      const { container } = render(<Group id="group" />);

      const group = container.querySelector("[data-group]");

      expect(group?.getAttribute("data-testid")).toBe("group");
      expect(group?.getAttribute("id")).toBe("group");
    });
  });
});

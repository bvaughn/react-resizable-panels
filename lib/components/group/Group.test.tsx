import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { moveSeparator } from "../../global/test/moveSeparator";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";
import { Panel } from "../panel/Panel";
import { Separator } from "../separator/Separator";
import { Group } from "./Group";

// TODO Dev warnings, including e.g. too many separators, non-unique panel ids

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
});

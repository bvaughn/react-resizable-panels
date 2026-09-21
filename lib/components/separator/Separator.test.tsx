import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import type { GroupImperativeHandle } from "../group/types";
import { describe, expect, test, vi } from "vitest";
import { subscribeToMountedGroup } from "../../global/mutable-state/groups";
import { moveSeparator } from "../../global/test/moveSeparator";
import { setElementBoundsFunction } from "../../utils/test/mockBoundingClientRect";
import { Group } from "../group/Group";
import { Panel } from "../panel/Panel";
import { Separator } from "./Separator";

describe("Separator", () => {
  describe.each(["horizontal", "vertical"] as const)(
    "zero-sized %s group",
    (orientation) => {
      test.each([false, true])(
        "supports prepending a panel (disabled: %s)",
        (disabled) => {
          setElementBoundsFunction(() => new DOMRect(0, 0, 0, 0));

          const ui = (showRail: boolean) => (
            <Group orientation={orientation}>
              {showRail && <Panel id="rail" disabled={disabled} />}
              {showRail && <Separator id="separator" />}
              <Panel id="main" />
            </Group>
          );

          const { rerender } = render(ui(false));
          rerender(ui(true));

          expect(screen.getByRole("separator")).toHaveAttribute(
            "aria-controls",
            "rail"
          );
          expect(screen.getByRole("separator")).toHaveAttribute(
            "aria-valuenow",
            "50"
          );
        }
      );

      test.each([false, true])(
        "supports remounting a middle panel (disabled: %s)",
        (disabled) => {
          setElementBoundsFunction(() => new DOMRect(0, 0, 0, 0));

          const ui = (showMiddle: boolean) => (
            <Group orientation={orientation}>
              <Panel id="a" />
              <Separator id="first" />
              {showMiddle && <Panel id="b" disabled={disabled} />}
              {showMiddle && <Separator id="second" />}
              <Panel id="c" disabled={disabled} />
            </Group>
          );

          const { rerender } = render(ui(true));
          rerender(ui(false));
          rerender(ui(true));

          expect(screen.getByTestId("first")).toHaveAttribute(
            "aria-controls",
            "a"
          );
          expect(screen.getByTestId("second")).toHaveAttribute(
            "aria-controls",
            "b"
          );
        }
      );
    }
  );

  describe("disabled prop", () => {
    test("keyboard resizing follows changes to disabled state", async () => {
      setElementBoundsFunction(
        (element) =>
          new DOMRect(
            element.id === "left" ? 0 : 50,
            0,
            element.id === "separator" ? 0 : 50,
            50
          )
      );
      const groupRef = createRef<GroupImperativeHandle>();
      const ui = (disabled: boolean) => (
        <Group groupRef={groupRef}>
          <Panel id="left" />
          <Separator disabled={disabled} id="separator" />
          <Panel id="right" />
        </Group>
      );
      const { rerender } = render(ui(true));
      rerender(ui(false));
      act(() => screen.getByRole("separator").focus());

      await userEvent.keyboard("{ArrowRight}");
      expect(groupRef.current!.getLayout()).toEqual({ left: 55, right: 45 });

      rerender(ui(true));
      expect(screen.getByRole("separator")).toHaveFocus();
      await userEvent.keyboard("{ArrowRight}{Home}{End}{Enter}");
      expect(groupRef.current!.getLayout()).toEqual({ left: 55, right: 45 });

      rerender(ui(false));
      await userEvent.keyboard("{ArrowLeft}");
      expect(groupRef.current!.getLayout()).toEqual({ left: 50, right: 50 });
    });

    test("changes to disabled prop should not cause the Separator to remount", () => {
      const onChange = vi.fn();
      const removeListener = subscribeToMountedGroup("group", onChange);

      const { rerender } = render(
        <Group id="group">
          <Panel />
          <Separator disabled id="left" />
          <Panel />
          <Separator id="right" />
          <Panel />
        </Group>
      );
      expect(onChange).toHaveBeenCalled();

      onChange.mockReset();

      rerender(
        <Group id="group">
          <Panel />
          <Separator id="left" />
          <Panel />
          <Separator disabled id="right" />
          <Panel />
        </Group>
      );
      expect(onChange).not.toHaveBeenCalled();

      removeListener();
    });

    test("changes to this prop should update Separator behavior", async () => {
      setElementBoundsFunction((element) => {
        switch (element.id) {
          case "left": {
            return new DOMRect(0, 0, 50, 50);
          }
          case "separator": {
            return new DOMRect(50, 0, 10, 50);
          }
          case "right": {
            return new DOMRect(60, 0, 50, 50);
          }
        }
      });

      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      const { rerender } = render(
        <Group
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="left" />
          <Separator id="separator" />
          <Panel id="right" />
        </Group>
      );

      onLayoutChange.mockReset();
      onLayoutChanged.mockReset();

      rerender(
        <Group
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="left" />
          <Separator disabled id="separator" />
          <Panel id="right" />
        </Group>
      );

      // Resize attempts should be ignored because the Panel is disabled
      await moveSeparator(25);
      expect(onLayoutChange).not.toHaveBeenCalled();
      expect(onLayoutChanged).not.toHaveBeenCalled();
      onLayoutChange.mockReset();
      onLayoutChanged.mockReset();

      rerender(
        <Group
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="left" />
          <Separator id="separator" />
          <Panel id="right" />
        </Group>
      );

      // Resize attempts should work now that the Panel has been re-enabled
      await moveSeparator(25);
      expect(onLayoutChange).toHaveBeenCalled();
      expect(onLayoutChanged).toHaveBeenCalled();
    });
  });

  describe("HTML attributes", () => {
    test("should expose id and data-testid", () => {
      render(
        <Group>
          <Panel />
          <Separator id="separator" />
          <Panel />
        </Group>
      );

      expect(screen.getByRole("separator")).toHaveAttribute(
        "data-testid",
        "separator"
      );
      expect(screen.getByRole("separator")).toHaveAttribute("id", "separator");
    });

    test("should pass through ...rest attributes", () => {
      render(
        <Group>
          <Panel />
          <Separator data-foo="abc" data-bar="123" />
          <Panel />
        </Group>
      );

      expect(screen.getByRole("separator")).toHaveAttribute("data-foo", "abc");
      expect(screen.getByRole("separator")).toHaveAttribute("data-bar", "123");
    });

    describe("ARIA attributes", () => {
      function printSeparators() {
        return screen
          .getAllByRole("separator")
          .map(
            (separator) => `${separator.id}
  controls: ${separator.getAttribute("aria-controls")}
  value: ${separator.getAttribute("aria-valuenow")}% (${separator.getAttribute("aria-valuemin")}% - ${separator.getAttribute("aria-valuemax")}%)
`
          )
          .join("\n");
      }

      test("should identify its primary panel if and only if it has an explicit id", () => {
        render(
          <Group>
            <Panel id="left-panel" />
            <Separator id="left-separator" />
            <Panel />
            <Separator id="right-separator" />
            <Panel />
          </Group>
        );

        expect(screen.getByTestId("left-separator")).toHaveAttribute(
          "aria-controls",
          "left-panel"
        );
        expect(screen.getByTestId("right-separator")).toHaveAttribute(
          "aria-controls"
        );
      });

      test("should compute values relative to the Group (not the Separator's own panel pair)", () => {
        render(
          <Group>
            <Panel id="left-panel" />
            <Separator id="left-separator" />
            <Panel id="middle-panel" />
            <Separator id="right-separator" />
            <Panel id="right-panel" />
          </Group>
        );

        expect(printSeparators()).toMatchInlineSnapshot(`
          "left-separator
            controls: left-panel
            value: 33.334% (0% - 100%)

          right-separator
            controls: middle-panel
            value: 33.333% (0% - 66.666%)
          "
        `);
      });

      test("should blah", () => {
        render(
          <Group>
            <Panel id="left-panel" />
            <Panel id="middle-panel" />
            <Separator id="only-separator" />
            <Panel id="right-panel" />
          </Group>
        );

        expect(printSeparators()).toMatchInlineSnapshot(`
          "only-separator
            controls: middle-panel
            value: 33.333% (0% - 66.666%)
          "
        `);
      });
    });
  });
});

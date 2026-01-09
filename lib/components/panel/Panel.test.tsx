import { act, render } from "@testing-library/react";
import { createRef, Profiler } from "react";
import { describe, expect, test, vi } from "vitest";
import { assert } from "../../utils/assert";
import { setDefaultElementBounds } from "../../utils/test/mockBoundingClientRect";
import { Group } from "../group/Group";
import type { GroupImperativeHandle } from "../group/types";
import { Panel } from "./Panel";

describe("Panel", () => {
  test("should throw if rendered outside of a Group", () => {
    expect(() => render(<Panel />)).toThrow(
      "Group Context not found; did you render a Panel or Separator outside of a Group?"
    );
  });

  describe("memoization", () => {
    test("Panels contents should not re-render on Group layout change", () => {
      const onGroupRender = vi.fn();
      const onPanelRender = vi.fn();
      const onPanelChildrenRender = vi.fn();

      const groupRef = createRef<GroupImperativeHandle>();

      function Child() {
        return <div />;
      }

      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

      render(
        <Profiler id="group" onRender={onGroupRender}>
          <Group groupRef={groupRef}>
            <Profiler id="panel" onRender={onPanelRender}>
              <Panel id="left" />
            </Profiler>
            <Panel id="right">
              <Profiler id="panel-children" onRender={onPanelChildrenRender}>
                <Child />
              </Profiler>
            </Panel>
          </Group>
        </Profiler>
      );

      expect(onGroupRender).toBeCalled();
      expect(onPanelRender).toBeCalled();
      expect(onPanelChildrenRender).toBeCalled();

      onGroupRender.mockReset();
      onPanelRender.mockReset();
      onPanelChildrenRender.mockReset();

      const api = groupRef.current;
      assert(api);

      act(() => {
        api.setLayout({
          left: 25,
          right: 75
        });
      });

      expect(onGroupRender).toBeCalledTimes(1);
      expect(onPanelRender).toBeCalled();
      expect(onPanelChildrenRender).not.toBeCalled();
    });
  });

  describe("HTML attributes", () => {
    test("should expose id as testid", () => {
      const { container } = render(
        <Group>
          <Panel id="panel" />
        </Group>
      );

      const panel = container.querySelector("[data-panel]") as HTMLElement;

      expect(panel.getAttribute("data-testid")).toBe("panel");
    });

    test("should pass through ...rest attributes", () => {
      const { container } = render(
        <Group>
          <Panel data-foo="abc" data-bar="123" />
        </Group>
      );

      const panel = container.querySelector("[data-panel]") as HTMLElement;

      expect(panel.getAttribute("data-foo")).toBe("abc");
      expect(panel.getAttribute("data-bar")).toBe("123");
    });

    test("problematic styles should be suppressed", () => {
      const { container } = render(
        <Group>
          <Panel
            style={{
              minHeight: 100,
              maxHeight: 100,
              height: 100,

              minWidth: 100,
              maxWidth: 100,
              width: 100,

              border: "100px solid black",
              borderWidth: 100,
              padding: 100,
              margin: 100
            }}
          />
        </Group>
      );

      const panel = container.querySelector("[data-panel]") as HTMLElement;

      expect(panel.style.minHeight).toBe("0");
      expect(panel.style.maxHeight).toBe("100%");
      expect(panel.style.height).toBe("auto");

      expect(panel.style.minWidth).toBe("0");
      expect(panel.style.maxWidth).toBe("100%");
      expect(panel.style.width).toBe("auto");

      expect(panel.style.border).toBe("0px");
      expect(panel.style.borderWidth).toBe("0px");
      expect(panel.style.padding).toBe("0px");
      expect(panel.style.margin).toBe("0px");
    });

    describe("ARIA attributes", () => {
      test("should pass through explicit id prop", () => {
        const { container } = render(
          <Group>
            <Panel id="panel" />
          </Group>
        );

        const panel = container.querySelector("[data-panel]") as HTMLElement;

        expect(panel.getAttribute("data-testid")).toBe("panel");
        expect(panel.getAttribute("id")).toBe("panel");
      });

      test("should assign an id prop to support the ARIA separator", () => {
        const { container } = render(
          <Group>
            <Panel />
          </Group>
        );

        const panel = container.querySelector("[data-panel]") as HTMLElement;

        expect(panel.hasAttribute("data-testid")).toBe(true);
        expect(panel.hasAttribute("id")).toBe(true);
      });
    });
  });
});

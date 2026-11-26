// @vitest-environment jsdom

import { act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { subscribeToMountedAxis } from "../../global/mutable-state/axes";
import type { SnapBehavior } from "../../global/types";
import { setElementBoundsFunction } from "../../shared/utils/test/mockBoundingClientRect";
import type {
  GroupImperativeHandle,
  GroupProps,
  Layout,
  PanelImperativeHandle,
  PanelProps
} from "../types";
import { Group } from "./Group";
import { Panel } from "./Panel";
import { Separator } from "./Separator";

let user: ReturnType<typeof userEvent.setup>;

// The Group is 100px wide, so pixels and percentages are interchangeable
beforeEach(() => {
  user = userEvent.setup();

  setElementBoundsFunction((element) => {
    switch (element.id) {
      case "a": {
        return new DOMRect(0, 0, 50, 50);
      }
      case "separator": {
        return new DOMRect(50, 0, 0, 50);
      }
      case "b": {
        return new DOMRect(50, 0, 50, 50);
      }
    }

    if (element.hasAttribute("data-group")) {
      return new DOMRect(0, 0, 100, 50);
    }
  });
});

function renderGroup({
  a,
  b,
  defaultLayout = { a: 50, b: 50 },
  group,
  snapBehavior
}: {
  group?: Partial<GroupProps>;
  a?: Partial<PanelProps>;
  b?: Partial<PanelProps>;
  defaultLayout?: Layout;
  snapBehavior?: SnapBehavior;
}) {
  const groupRef = createRef<GroupImperativeHandle>();
  const panelRef = createRef<PanelImperativeHandle>();

  const result = render(
    <Group
      defaultLayout={defaultLayout}
      groupRef={groupRef}
      id="group"
      snapBehavior={snapBehavior}
      {...group}
    >
      <Panel id="a" panelRef={panelRef} {...a} />
      <Separator id="separator" />
      <Panel id="b" {...b} />
    </Group>
  );

  return {
    ...result,
    getLayout: () => groupRef.current!.getLayout(),
    panelRef
  };
}

async function pointerDown() {
  await user.pointer({
    keys: "[MouseLeft>]",
    target: document.querySelector<HTMLElement>('[data-testid="separator"]')!,
    coords: { clientX: 50, clientY: 25 }
  });
}

async function pointerMove(clientX: number) {
  await user.pointer({ coords: { clientX, clientY: 25 } });
}

async function pointerUp() {
  await user.pointer({ keys: "[/MouseLeft]" });
}

async function drag(clientX: number) {
  await pointerDown();
  await pointerMove(clientX);
  await pointerUp();
}

describe("snapSizes", () => {
  describe('snapBehavior="on-drag"', () => {
    test("should snap to the nearest snap size while dragging", async () => {
      const { getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%", "75%"] }
      });

      await pointerDown();
      await pointerMove(70);
      expect(getLayout()).toEqual({ a: 75, b: 25 });
      await pointerUp();
      expect(getLayout()).toEqual({ a: 75, b: 25 });
    });

    test("should stay at its current snap size if that is the nearest one", async () => {
      const { getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%", "75%"] }
      });

      await drag(60);
      expect(getLayout()).toEqual({ a: 50, b: 50 });
    });

    test("should snap to the snap sizes of the panel after the separator", async () => {
      const { getLayout } = renderGroup({ b: { snapSizes: ["30%"] } });

      await drag(65);
      expect(getLayout()).toEqual({ a: 70, b: 30 });
    });

    test("should ignore snap sizes that other constraints prevent", async () => {
      const { getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%", "75%"] },
        b: { minSize: "30%" }
      });

      await drag(72);
      expect(getLayout()).toEqual({ a: 50, b: 50 });
    });

    test("should move freely if other constraints prevent all of the snap sizes", async () => {
      const { getLayout } = renderGroup({
        a: { snapSizes: ["75%"] },
        b: { minSize: "30%" }
      });

      await drag(65);
      expect(getLayout()).toEqual({ a: 65, b: 35 });
    });

    test("should support pixel snap sizes", async () => {
      const { getLayout } = renderGroup({ a: { snapSizes: [20] } });

      await drag(25);
      expect(getLayout()).toEqual({ a: 20, b: 80 });
    });

    test("should collapse collapsible panels", async () => {
      const { getLayout } = renderGroup({
        a: { collapsible: true, minSize: "20%", snapSizes: ["40%"] }
      });

      await drag(5);
      expect(getLayout()).toEqual({ a: 0, b: 100 });
    });

    test("should not affect panels without snap sizes", async () => {
      const { getLayout } = renderGroup({});

      await drag(63);
      expect(getLayout()).toEqual({ a: 63, b: 37 });
    });
  });

  describe('snapBehavior="on-release"', () => {
    test("should move freely until the pointer is released", async () => {
      const { getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%", "75%"] },
        snapBehavior: "on-release"
      });

      await pointerDown();
      await pointerMove(65);
      expect(getLayout()).toEqual({ a: 65, b: 35 });

      await pointerUp();
      expect(getLayout()).toEqual({ a: 75, b: 25 });
    });
  });

  describe("on-release extras", () => {
    test("should snap if the drag is cancelled", async () => {
      const { getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%", "75%"] },
        snapBehavior: "on-release"
      });

      await pointerDown();
      await pointerMove(65);
      expect(getLayout()).toEqual({ a: 65, b: 35 });

      act(() => {
        window.dispatchEvent(new Event("blur"));
      });
      expect(getLayout()).toEqual({ a: 75, b: 25 });
    });

    test("should preview and commit snapped layouts in separator preview mode", async () => {
      const { getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%", "75%"] },
        group: { resizePreviewMode: "separator" },
        snapBehavior: "on-release"
      });

      await pointerDown();
      await pointerMove(65);
      expect(getLayout()).toEqual({ a: 50, b: 50 });
      await pointerUp();
      expect(getLayout()).toEqual({ a: 75, b: 25 });
    });

    test("should report intermediate layouts while dragging and a snapped layout when done", async () => {
      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();
      const { getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%", "75%"] },
        group: { onLayoutChange, onLayoutChanged },
        snapBehavior: "on-release"
      });

      await pointerDown();
      await pointerMove(65);
      expect(onLayoutChange).toHaveBeenLastCalledWith({ a: 65, b: 35 });
      expect(onLayoutChanged).toHaveBeenCalledTimes(1);

      await pointerUp();
      expect(getLayout()).toEqual({ a: 75, b: 25 });
      expect(onLayoutChanged).toHaveBeenLastCalledWith(
        { a: 75, b: 25 },
        expect.objectContaining({ isUserInteraction: true })
      );
    });
  });

  test("should not move a panel without a neighboring separator off of its snap sizes", async () => {
    setElementBoundsFunction((element) => {
      switch (element.id) {
        case "a": {
          return new DOMRect(0, 0, 30, 50);
        }
        case "separator": {
          return new DOMRect(30, 0, 0, 50);
        }
        case "b": {
          return new DOMRect(30, 0, 30, 50);
        }
        case "separator2": {
          return new DOMRect(60, 0, 0, 50);
        }
        case "c": {
          return new DOMRect(60, 0, 40, 50);
        }
      }

      if (element.hasAttribute("data-group")) {
        return new DOMRect(0, 0, 100, 50);
      }
    });

    const groupRef = createRef<GroupImperativeHandle>();
    render(
      <Group
        defaultLayout={{ a: 30, b: 30, c: 40 }}
        groupRef={groupRef}
        id="group"
      >
        <Panel id="a" snapSizes={["30%", "50%"]} />
        <Separator id="separator" />
        <Panel id="b" minSize="20%" />
        <Separator id="separator2" />
        <Panel id="c" snapSizes={["40%"]} />
      </Group>
    );

    await user.pointer({
      keys: "[MouseLeft>]",
      target: document.querySelector<HTMLElement>('[data-testid="separator"]')!,
      coords: { clientX: 30, clientY: 25 }
    });
    await user.pointer({ coords: { clientX: 50, clientY: 25 } });
    await user.pointer({ keys: "[/MouseLeft]" });

    expect(groupRef.current!.getLayout()).toEqual({ a: 30, b: 30, c: 40 });
  });

  describe("Home and End", () => {
    test("should move to the smallest and largest snap sizes", async () => {
      const { getByTestId, getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%", "75%"] }
      });
      act(() => getByTestId("separator").focus());

      await user.keyboard("{End}");
      expect(getLayout()).toEqual({ a: 75, b: 25 });

      await user.keyboard("{Home}");
      expect(getLayout()).toEqual({ a: 25, b: 75 });
    });

    test("should still use min and max sizes without snap sizes", async () => {
      const { getByTestId, getLayout } = renderGroup({
        a: { maxSize: "80%", minSize: "10%" }
      });
      act(() => getByTestId("separator").focus());

      await user.keyboard("{End}");
      expect(getLayout()).toEqual({ a: 80, b: 20 });

      await user.keyboard("{Home}");
      expect(getLayout()).toEqual({ a: 10, b: 90 });
    });
  });

  test("the imperative expand API should expand a collapsed panel to its smallest snap size", () => {
    const { getLayout, panelRef } = renderGroup({
      a: { collapsible: true, minSize: "20%", snapSizes: ["40%", "60%"] },
      defaultLayout: { a: 0, b: 100 }
    });

    act(() => panelRef.current!.expand());
    expect(getLayout()).toEqual({ a: 40, b: 60 });
  });

  test("the imperative resize API should resize to the nearest snap size", () => {
    const { getLayout, panelRef } = renderGroup({
      a: { snapSizes: ["25%", "75%"] }
    });

    act(() => panelRef.current!.resize("60%"));
    expect(getLayout()).toEqual({ a: 75, b: 25 });
  });

  test("the imperative resize API should ignore snap sizes outside of min/max", () => {
    const { getLayout, panelRef } = renderGroup({
      a: { minSize: "20%", snapSizes: ["5%", "30%"] }
    });

    act(() => panelRef.current!.resize("10%"));
    expect(getLayout()).toEqual({ a: 30, b: 70 });
  });

  describe("layouts", () => {
    test("should snap the default layout", () => {
      const { getLayout } = renderGroup({
        a: { snapSizes: ["25%", "75%"] },
        defaultLayout: { a: 35, b: 65 }
      });

      expect(getLayout()).toEqual({ a: 25, b: 75 });
    });

    test("should not collapse expanded panels that are nearer their collapsed size", () => {
      const { getLayout } = renderGroup({
        a: { collapsible: true, minSize: "10%", snapSizes: ["40%", "60%"] },
        defaultLayout: { a: 15, b: 85 }
      });

      expect(getLayout()).toEqual({ a: 40, b: 60 });
    });

    test("should not expand collapsed panels", () => {
      const { getLayout } = renderGroup({
        a: { collapsible: true, minSize: "10%", snapSizes: ["40%", "60%"] },
        defaultLayout: { a: 0, b: 100 }
      });

      expect(getLayout()).toEqual({ a: 0, b: 100 });
    });

    test("should still collapse panels below their min size", () => {
      const { getLayout } = renderGroup({
        a: { collapsible: true, minSize: "10%", snapSizes: ["40%", "60%"] },
        defaultLayout: { a: 4, b: 96 }
      });

      expect(getLayout()).toEqual({ a: 0, b: 100 });
    });

    test("should snap layouts set with the imperative API", () => {
      const groupRef = createRef<GroupImperativeHandle>();
      render(
        <Group groupRef={groupRef}>
          <Panel id="a" snapSizes={["25%", "50%"]} />
          <Separator id="separator" />
          <Panel id="b" />
        </Group>
      );

      let layout: Layout | undefined = undefined;
      act(() => {
        layout = groupRef.current!.setLayout({ a: 30, b: 70 });
      });
      expect(layout).toEqual({ a: 25, b: 75 });
      expect(groupRef.current!.getLayout()).toEqual({ a: 25, b: 75 });
    });

    test("should snap the items before each separator first", () => {
      setElementBoundsFunction((element) => {
        switch (element.id) {
          case "a": {
            return new DOMRect(0, 0, 33, 50);
          }
          case "b": {
            return new DOMRect(33, 0, 33, 50);
          }
          case "c": {
            return new DOMRect(66, 0, 34, 50);
          }
        }

        if (element.hasAttribute("data-group")) {
          return new DOMRect(0, 0, 100, 50);
        }
      });

      const groupRef = createRef<GroupImperativeHandle>();
      render(
        <Group groupRef={groupRef}>
          <Panel id="a" snapSizes={["20%"]} />
          <Separator />
          <Panel id="b" snapSizes={["30%"]} />
          <Separator />
          <Panel id="c" snapSizes={["10%"]} />
        </Group>
      );

      act(() => {
        groupRef.current!.setLayout({ a: 25, b: 25, c: 50 });
      });
      // The last item can't also be snapped without un-snapping the item before it
      expect(groupRef.current!.getLayout()).toEqual({ a: 20, b: 30, c: 50 });
    });

    test("should re-snap pixel snap sizes when the group is resized", () => {
      const setGroupWidth = (width: number) =>
        setElementBoundsFunction((element) => {
          switch (element.id) {
            case "a": {
              return new DOMRect(0, 0, width / 2, 50);
            }
            case "separator": {
              return new DOMRect(width / 2, 0, 0, 50);
            }
            case "b": {
              return new DOMRect(width / 2, 0, width / 2, 50);
            }
          }

          if (element.hasAttribute("data-group")) {
            return new DOMRect(0, 0, width, 50);
          }
        });
      setGroupWidth(100);

      const { getLayout } = renderGroup({
        a: { snapSizes: [20, 50] },
        defaultLayout: { a: 20, b: 80 }
      });
      expect(getLayout()).toEqual({ a: 20, b: 80 });

      // 20% of 200px is 40px; the nearest snap size is 50px (25%)
      act(() => setGroupWidth(200));
      expect(getLayout()).toEqual({ a: 25, b: 75 });

      // The requested layout is not snapped, so it is restored
      act(() => setGroupWidth(100));
      expect(getLayout()).toEqual({ a: 20, b: 80 });
    });
  });

  describe("keyboard", () => {
    test("arrow keys should move to the next snap size", async () => {
      const { getByTestId, getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%", "75%"] }
      });

      act(() => getByTestId("separator").focus());

      await user.keyboard("{ArrowRight}");
      expect(getLayout()).toEqual({ a: 75, b: 25 });

      await user.keyboard("{ArrowLeft}");
      expect(getLayout()).toEqual({ a: 50, b: 50 });
    });

    test("arrow keys should not move past the last snap size", async () => {
      const { getByTestId, getLayout } = renderGroup({
        a: { snapSizes: ["25%", "50%"] }
      });

      act(() => getByTestId("separator").focus());

      await user.keyboard("{ArrowRight}");
      expect(getLayout()).toEqual({ a: 50, b: 50 });

      await user.keyboard("{ArrowLeft}");
      expect(getLayout()).toEqual({ a: 25, b: 75 });
    });

    test("arrow keys should expand a collapsed panel to its smallest snap size", async () => {
      const { getByTestId, getLayout, panelRef } = renderGroup({
        a: { collapsible: true, minSize: "20%", snapSizes: ["40%", "60%"] }
      });

      act(() => panelRef.current!.collapse());
      expect(getLayout()).toEqual({ a: 0, b: 100 });

      act(() => getByTestId("separator").focus());

      await user.keyboard("{ArrowRight}");
      expect(getLayout()).toEqual({ a: 40, b: 60 });
    });

    test("enter should expand a collapsed panel to its smallest snap size", async () => {
      const { getByTestId, getLayout } = renderGroup({
        a: { collapsible: true, minSize: "20%", snapSizes: ["40%", "60%"] },
        defaultLayout: { a: 0, b: 100 }
      });

      act(() => getByTestId("separator").focus());

      await user.keyboard("{Enter}");
      expect(getLayout()).toEqual({ a: 40, b: 60 });
    });

    test("arrow keys should use the default step for panels without snap sizes", async () => {
      const { getByTestId, getLayout } = renderGroup({});

      act(() => getByTestId("separator").focus());

      await user.keyboard("{ArrowRight}");
      expect(getLayout()).toEqual({ a: 55, b: 45 });
    });
  });

  test("inline snap sizes should not cause the Group to remount", () => {
    const onChange = vi.fn();
    const removeListener = subscribeToMountedAxis("group", onChange);

    const { rerender } = render(
      <Group id="group">
        <Panel id="a" snapSizes={["25%"]} />
        <Panel id="b" />
      </Group>
    );
    expect(onChange).toHaveBeenCalled();

    onChange.mockReset();

    rerender(
      <Group id="group">
        <Panel id="a" snapSizes={["25%"]} />
        <Panel id="b" />
      </Group>
    );
    expect(onChange).not.toHaveBeenCalled();

    removeListener();
  });
});
